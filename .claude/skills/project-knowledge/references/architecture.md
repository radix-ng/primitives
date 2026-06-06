---
name: architecture
description: Tech stack, monorepo structure, key dependencies, and composition primitives for Radix NG
metadata:
  type: project
---

# Architecture

## Tech stack

| Layer                  | Choice                                                   | Why                                                           |
| ---------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| Framework              | Angular 21, zoneless                                     | Modern signals API; zoneless for performance                  |
| Monorepo               | Nx 22 + pnpm workspaces                                  | Task caching, affected-graph CI, secondary entry generation   |
| Build                  | ng-packagr                                               | Angular library standard; each primitive is a secondary entry |
| Tests                  | Vitest + AnalogJS vite plugin + @testing-library/angular | Faster than Jest; AnalogJS bridges Angular and Vite           |
| Storybook              | Storybook 10 + @storybook/angular + AnalogJS             | Visual development; Chromatic for visual regression           |
| Styling (stories only) | Tailwind v4 (CSS-based config, no tailwind.config.js)    | Zero-style primitives; Tailwind only in demo/story layer      |
| Positioning            | @floating-ui/dom                                         | Precise floating element positioning (popover, tooltip, etc.) |
| Dates                  | @internationalized/date, @internationalized/number       | Locale-aware date/number primitives                           |
| Icons (stories)        | @lucide/angular                                          | Consistent icon set in demos                                  |

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
  radix-storybook/     ← Storybook app (port 4400)
  radix-docs/          ← documentation site (Astro)
  radix-ssr-testing/   ← SSR smoke-test app
packages/
  components/          ← styled components consuming primitives (not part of published lib)
tools/scripts/         ← build helpers (typedoc, api-docs)
```

## Shared building blocks (composition primitives in `packages/primitives/`)

These are the headless infrastructure layers that complex primitives compose:

- **`core`** — `createContext`, `useArrowNavigation`, id generators, shared types (`DataOrientation`, `AcceptableValue`, `isNullish`), plus overlay infrastructure shared across primitives: `useTransitionStatus` (open/close transition state machine + `getMaxTransitionDuration`) and `useScrollLock` (body scroll lock with one process-wide counter, so concurrent overlays compose correctly). Used by dialog and popover
- **`collection`** — `RdxCollectionProvider` + `RdxCollectionItem`: collects child items in DOM order via `contentChildren`; only used by `select` currently
- **`portal`** — `RdxPortal`: teleports host element into a container (default `document.body`)
- **`presence`** — conditional mount/unmount with enter/leave animation hooks (waits for `animationend`, not `transitionend`)
- **`roving-focus`** — focus roving for keyboard list navigation
- **`focus-scope`** — focus trap for dialogs and modals
- **`focus-guards`** — sentinel elements for focus containment
- **`popper`** — floating-ui wrapper for positioned overlays
- **`dismissable-layer`** — outside-dismiss via Escape / pointer-down-outside / focus-outside. Focus-outside check is async (two microtasks); register external triggers as branches via `rdxDismissableLayerBranch` to prevent premature dismissal

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
- **Tabs follow the Base UI part set** — `tabs` was realigned to `Root`/`List`/`Tab`/`Panel`/`Indicator` (newer no-suffix class names). Activation moved to the `List` (`activateOnFocus`, default **manual**) instead of the root; `data-active`/`data-hidden`/`data-activation-direction`/`data-starting-style`/`data-ending-style` replace `data-state`. `Panel` stays mounted and toggles `hidden` by default; `*rdxTabsPanelPresence` opts into real unmount with exit animations (same two-directive pattern as Collapsible). `Indicator` exposes the active tab geometry as `--active-tab-*` CSS variables.
- **Toggle is one part, standalone or grouped (Base UI)** — `toggle`/`toggle-group` were realigned so a single `RdxToggle` works on its own **or** as a `[rdxToggleGroup]` item (pressed state derived from the group's array `value`, joining its roving focus) — there is no separate group-item directive. `data-pressed` replaces `data-state`. `RdxToggleGroup` takes an **array** `value` with `multiple`/`loopFocus` (shared logic in `toggle-group-base.ts`); `RdxToggleGroupWithoutFocus` is the roving-less variant for toolbars. **Cross-cutting enabler:** `RdxRovingFocusItemDirective` was made **group-optional** (injects the group with `{ optional }`, degrades to a plain element with no managed tabindex when absent) so the same `RdxToggle` works standalone, inside a toggle group, and inside a toolbar — affects every roving consumer but is behavior-preserving when a group is present.
- **Toolbar follows the Base UI part set** — `toolbar` was rewritten to `Root`/`Button`/`Link`/`Input`/`Group`/`Separator` over `roving-focus`, with root/group `disabled` cascading through context and `focusableWhenDisabled` keeping disabled items reachable. Toggle groups compose via `rdxToggleGroupWithoutFocus` + `rdxToggle`. `RdxToolbarInput` is a **composite input**: a constructor-registered `keydown` listener (registered before the roving item's host listener, so it runs first at the target) keeps arrow keys for the text caret and only yields to roving navigation when the caret is at the matching edge.
- **Switch follows the Base UI part set** — `switch` was realigned to `Root`/`Thumb`/`Input` (no-suffix classes, `createContext`). `data-checked`/`data-unchecked` replace `data-state`; added `data-disabled`/`data-readonly`/`data-required`. The root gained Base UI props `readOnly` (focusable but not toggleable), `name` and `value` (submitted via the hidden `[rdxSwitchInput]` checkbox), keeping the existing `RdxControlValueAccessor` host-directive for Reactive Forms. This also advanced `signal-forms-readiness.md` (adds `readonly`/`name`) and dropped CDK `_IdGenerator` for the `core` generator (prep #6). The `invalid`/`errors`/`touched`/`dirty` batch is still deferred to the shared Signal Forms pattern.
- **Slider is a directive-based Base UI compound** — `slider` was rewritten from components to the Base UI part set (`Root`/`Control`/`Track`/`Indicator`/`Thumb`/`ThumbInput`/`Value`), deleting the duplicated horizontal/vertical components and the orientation-context service — **one** directive set drives both orientations off the `orientation` signal. The `Root` (composing `RdxControlValueAccessor`) owns value/state/thumb-registration; the `Control` handles pointer press/drag and maps position→value; each `Thumb` wraps a visually-hidden native `input[type=range]` (`ThumbInput`) that drives keyboard, a11y and form submission. Single value is a **number**, range is a **number[]** (`range = Array.isArray(value)`); one `Thumb` per value, with `thumbCollisionBehavior` (push/swap/none), `minStepsBetweenValues`, `largeStep`, and `Intl.NumberFormat` value formatting. State is exposed via `data-orientation`/`data-disabled`/`data-dragging` (plus `data-index` per thumb). This resolved the slider blocker in `signal-forms-readiness.md` — `modelValue` was renamed to `value` (the `FormValueControl` required signal), `name`/`form` added — and switched id generation from CDK `_IdGenerator` to the `core` generator (prep #6).

## External peer dependencies (installed by ng-add)

`@angular/common` (matched to app version), `@angular/cdk`, `@floating-ui/dom`, `@internationalized/date`, `@internationalized/number`

## @angular/cdk — migration direction

**Goal: remove `@angular/cdk` as a peer dependency entirely.** New code must not add new CDK imports.

Current state of CDK usage — what still needs to be replaced:

| CDK import                   | Used for              | Where                                             |
| ---------------------------- | --------------------- | ------------------------------------------------- |
| `_IdGenerator` (`cdk/a11y`)  | Unique ID generation  | accordion, tooltip, popover, preview-card, dialog |
| `LiveAnnouncer` (`cdk/a11y`) | ARIA live region      | stepper                                           |
| `Platform` (`cdk/platform`)  | SSR/browser detection | `core/is-client`                                  |

Type-only imports that are low-priority (zero runtime cost, but ideally replaced with own types):

- `BooleanInput`, `NumberInput` (`cdk/coercion`) — used as TypeScript type parameters in 67 files
- `Direction` (`cdk/bidi`) — type alias for `'ltr' | 'rtl'`; can be replaced with a local type in `core`

## tsconfig paths

Each new primitive must be registered in root `tsconfig.base.json` under `compilerOptions.paths` as `"@radix-ng/primitives/<name>": ["packages/primitives/<name>/index.ts"]`.
