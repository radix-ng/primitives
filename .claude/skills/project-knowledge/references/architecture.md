---
name: architecture
description: Tech stack, monorepo structure, key dependencies, and composition primitives for Radix NG
metadata:
  type: project
---

# Architecture

## Tech stack

| Layer                  | Choice                                                   | Why                                                                                            |
| ---------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Framework              | Angular 21, zoneless                                     | Modern signals API; zoneless for performance                                                   |
| Monorepo               | Nx 22 + pnpm workspaces                                  | Task caching, affected-graph CI, secondary entry generation                                    |
| Build                  | ng-packagr                                               | Angular library standard; each primitive is a secondary entry                                  |
| Tests                  | Vitest + AnalogJS vite plugin + @testing-library/angular | Faster than Jest; AnalogJS bridges Angular and Vite; runs zoneless/zone-free (see patterns.md) |
| Storybook              | Storybook 10 + @storybook/angular + AnalogJS             | Visual development; Chromatic for visual regression                                            |
| Styling (stories only) | Tailwind v4 (CSS-based config, no tailwind.config.js)    | Zero-style primitives; Tailwind only in demo/story layer                                       |
| Positioning            | @floating-ui/dom                                         | Precise floating element positioning (popover, tooltip, etc.)                                  |
| Dates                  | @internationalized/date, @internationalized/number       | Locale-aware date/number primitives                                                            |
| Icons (stories)        | @lucide/angular                                          | Consistent icon set in demos                                                                   |

## Monorepo layout

```
packages/
  primitives/          ← published library (@radix-ng/primitives)
    <name>/
      index.ts         ← barrel exports + optional NgModule
      ng-package.json  ← secondary entry: {"lib":{"entryFile":"index.ts"}}
      src/             ← directive implementations
      __tests__/       ← Vitest specs
      stories/         ← Storybook stories + demo components
    storybook/         ← shared story utilities (styles.ts, tailwind-demo.ts, etc.)
    schematics/        ← ng-add schematic
apps/
  radix-storybook/     ← Storybook app (port 4400); also the public site on radix-ng.com
  radix-docs/          ← Astro docs site (deprecated, not deployed)
  radix-ssr-testing/   ← SSR smoke-test app
skills/                ← LLM consumer Agent Skills (radix-ng, radix-ng-examples)
tools/scripts/         ← build helpers (typedoc/api-docs, skills bundle generator)
```

## Shared building blocks (composition primitives in `packages/primitives/`)

These are the headless infrastructure layers that complex primitives compose:

- **`core`** — `createContext`, `useArrowNavigation`, id generators, shared types (`DataOrientation`, `AcceptableValue`, `Direction`, `BooleanInput`/`NumberInput`), `isNullish`/`isEqual`, `RdxLiveAnnouncer`, plus overlay infrastructure shared across primitives: `useTransitionStatus` (open/close transition state machine; completes on the real `animationend`/`transitionend` via the Web Animations API, with `getMaxTransitionDuration` now only feeding a safety-net timer for transitions that never settle — used by dialog, popover, collapsible, tabs, navigation-menu) and `useScrollLock` (body scroll lock with one process-wide counter, so concurrent overlays compose correctly). **Internal layout:** top-level files are grouped into `dom/` (DOM/browser access: `document`, `element-size`, `get-active-element`, `use-resize-observer`, `use-scroll-lock`), `composables/` (reka-ui-style: `use-arrow-navigation`, `use-grace-area`, `use-transition-status`, `watch`), `predicates.ts` (`isNullish`, `isEqual`), plus the existing `accessor/`, `date-time/`, `positioning/`, `signal-forms/`. File names are kebab-case; export names are unchanged, and everything is re-exported from the package barrel `index.ts` (consumers never deep-import). `isEqual` is a compact structural deep-equal for primitive/array/plain-object values — the old `object-hash`-style `serialize` helper was removed. Dead/unused exports were dropped in a breaking cleanup: `injectIsClient`, `WINDOW`/`injectWindow`, `isInsideForm`, `isNumber`, `injectNgControl`, `RdxFocusInitialDirective`, `isValueEqualOrExist`, and the unused `OnMountDirective`
- **`collection`** — `RdxCollectionProvider` + `RdxCollectionItem`: collects child items in DOM order via `contentChildren`; only used by `select` currently
- **`portal`** — `RdxPortal`: teleports host element into a container (default `document.body`)
- **`presence`** — conditional mount/unmount with enter/leave animation hooks (waits for `animationend`, not `transitionend`)
- **`roving-focus`** — focus roving for keyboard list navigation
- **`focus-scope`** — focus trap for dialogs and modals
- **`focus-guards`** — sentinel elements for focus containment
- **`popper`** — floating-ui wrapper for positioned overlays
- **`dismissable-layer`** — outside-dismiss via Escape / pointer-down-outside / focus-outside. Focus-outside check is async (two microtasks); register external triggers as branches via `rdxDismissableLayerBranch` to prevent premature dismissal

## Date-time fields (`core/date-time`)

`useDateField` is the shared segment-editing engine behind **date-field**, **time-field**, and **calendar** (with `parser`, `formatter`, `comparators`, `placeholders` wrapping `@internationalized/date`). Invariants worth preserving — each underpins a fixed bug, so don't regress them:

- **Commit rule:** a value is committed only when **every** entry in `segmentValues` is non-null. A time-only field therefore must initialize without date parts — `initializeSegmentValues(granularity, /* isTimeValue */ true)` — otherwise `day`/`month`/`year` stay null and the field never commits.
- **Hour is canonical 24-hour.** `segmentValues.hour` is always 0–23. 12-hour display/typing converts via `to12Hour` / `to24Hour`; the day period is derived with `dayPeriodForHour`. The `dayPeriod` segment owns AM/PM — typing the hour must not flip it. `updateHour` takes an hour-cycle-aware `max` (12 or 23).
- **Numeric segment entry** (day/month/hour/minute/second) is one helper, `updateNumberSegment(num, prev, max, { emptyZero, moveOnOverflow })`; `updateYear` is separate (4-digit). Keep them unified — they previously drifted.
- **time-field write-back:** time-field edits land in an internal `convertedModelValue` (always a `CalendarDateTime`, so the editor has a date context). It must be mirrored back to the public `value` model (converting to `Time` for time-only models) — **writing a `linkedSignal` does not propagate to its source**, so the mirror is an explicit, guarded `watch`.
- **Placeholder vs locale:** the placeholder is seeded once at construction, before `locale` binds. date-field/calendar re-seed it on locale change (comparing calendar `identifier`) while the field is empty, so non-Gregorian calendars (Buddhist/Japanese) render correctly.
- **Single sources of truth:** `TIME_GRANULARITIES` (in `comparators.ts`) for which granularities carry time; `DateFormatter` instances are cached in `formatter.ts` (never construct `Intl.DateTimeFormat` per call in the per-keystroke formatting path).
- **`getDaysBetween(start, end)` is exclusive of both ends** (used in `calendar.ts` with ±1-day offsets to build inclusive grid ranges). Counting an inclusive span from it needs an extra day — e.g. `getWeekNumber` passes `date.add({ days: 1 })`, otherwise every 7-day boundary is under-counted by one.

## DI context pattern

Every primitive family exposes state via `createContext` from `@radix-ng/primitives/core`. The root directive provides context; children inject it. Optionality: `injectFooContext()` throws if absent; `injectFooContext(true)` returns null.

## Key architectural decisions

- **`hostDirectives` composition** — primitives reuse each other (e.g., AccordionItem composes CollapsibleRoot) without inheritance
- **Checkbox group co-location** — `RdxCheckboxGroupDirective` lives in the same ng-packagr entry as `RdxCheckboxRootDirective` to avoid circular cross-entry imports
- **`data-*` state only** — inline styles are never used for state; CSS custom properties are the only exception (for animation dimensions)
- **`undefined` removes attributes** — `host` bindings use `undefined` (not `null` or `false`) to remove attributes
- **`defaultValue` via `effect()`** — uncontrolled initialization is done in `constructor()` with an `effect()`
- **Dialog is a declarative compound** — `dialog` was rewritten off `cdk/dialog` into a Base UI-style compound (Root/Trigger/Portal/Backdrop/Popup/Title/Description/Close, plus Viewport and a detached-trigger handle) built on the shared `dismissable-layer` + `focus-scope` + `presence` + `portal` layers. It mirrors `popover` (the reference for this pattern)
- **Alert Dialog is a thin layer over Dialog** — every `alert-dialog` part is a thin `hostDirectives` wrapper around the matching dialog part (its own `rdxAlertDialog*` selector), so the dialog primitive stays headless and knows nothing about its consumers. Alert semantics come from an injected **dialog variant** (`RDX_DIALOG_VARIANT` / `provideRdxDialogVariant`), a small behavioral profile with three independent flags — `role`, `forceModal`, `forcePointerDismissalDisabled` — that the dialog root folds into its effective `modal` / `disablePointerDismissal` / popup `role`. Keeping the flags independent (rather than deriving dismissal from role) lets future variants like Drawer reuse the same hook. Alert dialogs set all three: `role="alertdialog"`, always modal, outside-press/focus-out dismissal off (Escape still closes). This removed the last `cdk/overlay`, `cdk/portal`, and `CdkTrapFocus` usage from the codebase. Same composition pattern as `context-menu` over `menu`
- **Navigation Menu is a Base UI-style compound** — `navigation-menu` was rewritten off its Radix port into the Base UI part set (Root/List/Item/Trigger/Icon/Content/Link/Portal/Backdrop/Positioner/Popup/Arrow/Viewport, `navigationMenuImports` array). A menubar `List` of triggers/links shares **one** popup, anchored to the active trigger via the `popper` primitive (`RdxPopper` on the Root, like `popover`) and mounted through `presence`/`portal`. The Root owns a `value`/`defaultValue` model (`open = value != null`) with `delay`/`closeDelay` (default 50) and a `useTransitionStatus` state machine; each `Item`'s `*rdxNavigationMenuContent` template is rendered into the shared `Viewport`, which morphs size and slides via `data-activation-direction`/`data-previous`. Menubar arrow-key nav uses `roving-focus`; in-content links are plain tabbable anchors (no roving). Keyboard model: roving moves between triggers, the orientation entry key (ArrowDown / ArrowRight) opens and moves focus into the panel, the open panel is navigated with arrows/Home/End (handled on the `Popup`), and open-follows-focus switches the active item while open. Triggers register as `dismissable-layer` branches so focus/pointer moving to a sibling trigger doesn't dismiss. Nested menus are a `Root` inside a `Content` (detected with `inject(RdxNavigationMenuRoot, { skipSelf })`); the outer `Popup` ignores arrow keys whose target sits in a nested `Root` so each menu owns its own navigation. This removed CDK `FocusKeyManager` and `FocusableOption` from the codebase
- **Menu submenus own their hover-close via a safe polygon** — a submenu opened **by hover** (not keyboard/click) closes _itself_ rather than being closed by a sibling stealing it. While open it attaches a single `document` `mousemove` handler that keeps it open as long as the pointer stays inside a triangular safe zone between the pointer's exit point and the popup — a faithful port of Floating UI's `safePolygon` (velocity gating, trough, per-side geometry) in `menu/src/menu-safe-polygon.ts` — plus a **pointer-events tunnel** that makes siblings inert mid-traverse (`pointer-events:none` on the parent popup, `auto` on trigger + popup), so a diagonal cut across a sibling subtrigger can't switch submenus on the way. The placed side is read **live** from the popup's `data-side` (Floating UI resolves it async and may flip it), so left/RTL submenus get correct geometry; nested levels are tracked by a small module-level open-submenu registry instead of Floating UI's tree. The menu root context surfaces the popup element via `popupElement`/`registerPopup` for the geometry. This is deliberately **not** the core `useGraceArea` composable (convex hull, `pointerleave`-driven, no tunnel): the submenu needs the richer algorithm and the sibling-blocking tunnel to match Base UI. Mouse-only and browser-only; behavior change vs. the old model — hovering a sibling now closes the open submenu. Each open submenu arms its own listener, so a deep open chain runs one handler per level (acceptable, mirrors Floating UI; a single coordinating listener is the fix if it ever profiles hot)
- **Tabs follow the Base UI part set** — `tabs` was realigned to `Root`/`List`/`Tab`/`Panel`/`Indicator` (newer no-suffix class names). Activation moved to the `List` (`activateOnFocus`, default **manual**) instead of the root; `data-active`/`data-hidden`/`data-activation-direction`/`data-starting-style`/`data-ending-style` replace `data-state`. `Panel` stays mounted and toggles `hidden` by default; `*rdxTabsPanelPresence` opts into real unmount with exit animations (same two-directive pattern as Collapsible). `Indicator` exposes the active tab geometry as `--active-tab-*` CSS variables.
- **Toggle is one part, standalone or grouped (Base UI)** — `toggle`/`toggle-group` were realigned so a single `RdxToggle` works on its own **or** as a `[rdxToggleGroup]` item (pressed state derived from the group's array `value`, joining its roving focus) — there is no separate group-item directive. `data-pressed` replaces `data-state`. `RdxToggleGroup` takes an **array** `value` with `multiple`/`loopFocus` (shared logic in `toggle-group-base.ts`); `RdxToggleGroupWithoutFocus` is the roving-less variant for toolbars. **Cross-cutting enabler:** `RdxRovingFocusItemDirective` was made **group-optional** (injects the group with `{ optional }`, degrades to a plain element with no managed tabindex when absent) so the same `RdxToggle` works standalone, inside a toggle group, and inside a toolbar — affects every roving consumer but is behavior-preserving when a group is present.
- **Toolbar follows the Base UI part set** — `toolbar` was rewritten to `Root`/`Button`/`Link`/`Input`/`Group`/`Separator` over `roving-focus`, with root/group `disabled` cascading through context and `focusableWhenDisabled` keeping disabled items reachable. Toggle groups compose via `rdxToggleGroupWithoutFocus` + `rdxToggle`. `RdxToolbarInput` is a **composite input**: a constructor-registered `keydown` listener (registered before the roving item's host listener, so it runs first at the target) keeps arrow keys for the text caret and only yields to roving navigation when the caret is at the matching edge.
- **Switch follows the Base UI part set** — `switch` was realigned to `Root`/`Thumb`/`Input` (no-suffix classes, `createContext`). `data-checked`/`data-unchecked` replace `data-state`; added `data-disabled`/`data-readonly`/`data-required`. The root gained Base UI props `readOnly` (focusable but not toggleable), `name` and `value` (submitted via the hidden `[rdxSwitchInput]` checkbox), keeping the existing `RdxControlValueAccessor` host-directive for Reactive Forms. This also advanced `signal-forms-readiness.md` (adds `readonly`/`name`) and dropped CDK `_IdGenerator` for the `core` generator (prep #6). The `invalid`/`errors`/`touched`/`dirty` batch is still deferred to the shared Signal Forms pattern.
- **Slider is a directive-based Base UI compound** — `slider` was rewritten from components to the Base UI part set (`Root`/`Control`/`Track`/`Indicator`/`Thumb`/`ThumbInput`/`Value`), deleting the duplicated horizontal/vertical components and the orientation-context service — **one** directive set drives both orientations off the `orientation` signal. The `Root` (composing `RdxControlValueAccessor`) owns value/state/thumb-registration; the `Control` handles pointer press/drag and maps position→value; each `Thumb` wraps a visually-hidden native `input[type=range]` (`ThumbInput`) that drives keyboard, a11y and form submission. Single value is a **number**, range is a **number[]** (`range = Array.isArray(value)`); one `Thumb` per value, with `thumbCollisionBehavior` (push/swap/none), `minStepsBetweenValues`, `largeStep`, and `Intl.NumberFormat` value formatting. State is exposed via `data-orientation`/`data-disabled`/`data-dragging` (plus `data-index` per thumb). This resolved the slider blocker in `signal-forms-readiness.md` — `modelValue` was renamed to `value` (the `FormValueControl` required signal), `name`/`form` added — and switched id generation from CDK `_IdGenerator` to the `core` generator (prep #6).
- **Scroll Area is a Base UI compound ported from `mui/base-ui`** — `scroll-area` is the Base UI part set (`Root`/`Viewport`/`Content`/`Scrollbar`/`Thumb`/`Corner`, no-suffix classes, `createContext`). It keeps the browser's **native** scrolling (momentum, keyboard, a11y), hides the platform scrollbar via a one-time injected stylesheet keyed on `[rdxScrollAreaViewport]`, and renders a custom thumb. The `Viewport` owns the measurement pass (`computeThumbPosition`): driven by `afterNextRender` + a `ResizeObserver` on the viewport and on the `Content`, plus an `effect` re-running on hidden-state/direction/threshold changes, it sizes/positions each thumb (`translate3d`), publishes overflow state as `data-scrolling`/`data-hovering`/`data-has-overflow-x/y`/`data-overflow-*-start/end`, and sets edge-distance CSS variables (`--scroll-area-overflow-*`, used by the gradient-fade example) plus `--scroll-area-corner-*` / `--scroll-area-thumb-*`. The `Root` holds the shared state and the imperative drag/wheel/track-click handlers; element refs are shared through context as React-style `{ current }` holders (child parts register in their constructor/`effect`). Two ports-to-Angular adaptations: a directive can't unmount its own host, so a `Scrollbar`/`Corner` that Base UI would unmount instead hides via `display: none` (`keepMounted` keeps it present); `RdxTabsIndicator` geometry was made content-relative (adds the list's `scrollLeft`/`scrollTop`) so the active-tab indicator tracks correctly when a `Tabs.List` is rendered as a `ScrollArea.Viewport` (the "combining with Tabs" example stacks both directives on one element).

## External peer dependencies (installed by ng-add)

`@angular/common` (matched to app version), `@floating-ui/dom`, `@internationalized/date`, `@internationalized/number`

## @angular/cdk — fully removed

**`@angular/cdk` is no longer a dependency** (not a peer, not installed by `ng-add`, not in the root lockfile). New code must not reintroduce CDK imports.

Own replacements for what CDK used to provide:

- `_IdGenerator` (`cdk/a11y`) → `RdxIdGenerator` + the `injectId(prefix)` hook in `core/src/id-generator.ts` (re-exported from `@radix-ng/primitives/core`). `injectId('rdx-…-')` is the call-site API (Angular counterpart of React's `useId`); it generates deterministic, SSR/hydration-stable IDs via a per-prefix counter folded with `APP_ID`. Inject `RdxIdGenerator` directly only when generating IDs lazily outside an injection context.
- `LiveAnnouncer` (`cdk/a11y`) → `RdxLiveAnnouncer` in `core/src/live-announcer.ts`: lazily appends a visually-hidden `aria-live` region to `document.body`, no-op on the server. Only consumer: stepper.
- `Platform` (`cdk/platform`) → `core/is-client` now uses `isPlatformBrowser(inject(PLATFORM_ID))` from `@angular/common`.
- `Direction` (`cdk/bidi`) → `core/src/types.ts` `export type Direction = 'ltr' | 'rtl'` (re-exported from `@radix-ng/primitives/core`).
- `BooleanInput`, `NumberInput` (`cdk/coercion`) → defined in `core/src/types.ts` (re-exported from `@radix-ng/primitives/core`). The transforms themselves are Angular's `booleanAttribute` / `numberAttribute`; CDK only ever supplied the input-value type aliases.
- CDK Dialog/Overlay, `cdk/portal`, and `CdkTrapFocus` were previously replaced with own implementations (so consumers no longer need `@angular/cdk/overlay-prebuilt.css`).

## LLM consumer skills & docs pipeline

`skills/` holds two consumer-facing Agent Skills distributed via skills.sh (install `npx skills add radix-ng/primitives/skills` — the `/skills` subpath scopes discovery so the repo's own `.claude/skills/` contributor skills aren't offered):

- **`radix-ng`** — hand-authored usage rules (`SKILL.md` + references for styling, composition, forms) plus a generated `styling-contract.json`: per-primitive parts, anatomy, and `data-*` attributes — the machine-readable styling contract for theming with any design system.
- **`radix-ng-examples`** — a generated `SKILL.md` indexing every documented example, with the full rendered docs bundled under `references/` (per-component `.md`, plus `llms.txt` index and `llms-full.txt`).

The Storybook docs MDX (`packages/primitives/**/stories/*.docs.mdx`) is the single source of truth. `tools/scripts/skills/generate.mjs` builds the bundle; `storybook-docs.mjs` is an Astro-independent port of the docs renderer (resolves `<Canvas>` blocks into real example source), so the pipeline does not depend on the deprecated Astro app. Hand-authored skill files are never overwritten by the generator.

The same bundle is consumed two ways: offline inside the installed skill, and online as static files served by Storybook from the main domain. Generated files are committed, excluded from Prettier (`.prettierignore`), and kept in sync by a CI job. See deployment.md for the build command, serving, and CI details.

## tsconfig paths

Each new primitive must be registered in root `tsconfig.base.json` under `compilerOptions.paths` as `"@radix-ng/primitives/<name>": ["packages/primitives/<name>/index.ts"]`.
