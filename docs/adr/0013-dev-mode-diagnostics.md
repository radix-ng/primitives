# ADR 0013: Dev-mode diagnostics & debuggability — one warning system, tag-aware checks, named signals

- Status: Accepted (Phases 1–2 implemented; Phase 3 `debugName` rolling — see "Implementation notes")
- Date: 2026-06-13
- Decision owners: Radix NG maintainers
- Related: `packages/primitives/core/src/create-context.ts` (missing-context error + docs link),
  ADR 0010 (portal misuse guards), `autocomplete-root.ts` (ad-hoc warn-once effect),
  `apps/radix-storybook/docs/overview/accessibility.docs.mdx`

## Context

A headless library's failure modes are invisible by construction: nothing renders wrong, the
popup just doesn't open, the label just isn't announced, the state just isn't styled. The
library already answers this in three unrelated dialects:

1. **`createContext` missing-context error** — descriptive, includes a
   `https://radix-ng.com/<docs>.md` link (`create-context.ts`). The gold standard; everything
   else should look like it.
2. **Portal misuse guards** (ADR 0010) — per-primitive `[rdxXxxPortal]:not(ng-template)`
   directives throwing in `isDevMode()`, each with a hand-written message.
3. **One ad-hoc warn-once effect** — `autocomplete-root.ts` warns when virtualized object items
   have no `itemToStringValue`, with hand-rolled `warned` flag plumbing.

There is no shared helper, no stable message codes, no dedup convention, and — measured today —
zero uses of `HOST_TAG_NAME` and zero `debugName`s on signals. Consumers debugging a primitive in
Angular DevTools see anonymous `computed #47` nodes, and a `rdxSelectTrigger` mistakenly placed on
a `<div>` fails silently (no keyboard activation, no `role`) instead of saying so.

## Decision

### 1. One diagnostics helper in `core`

`core/src/dev/diagnostics.ts`:

```ts
/** Stable, searchable code: 'select/trigger-element', 'field/unassociated-label', … */
export function rdxDevWarning(code: string, message: string, docsPath?: string): void;
export function rdxDevError(code: string, message: string, docsPath?: string): never;
```

- Both are no-ops / plain throws unless `isDevMode()`; bodies are written so production builds
  tree-shake the message assembly (follow the `ngDevMode` guard pattern Angular itself uses).
- Messages are prefixed `[rdx:<code>]` and end with the same
  `See https://radix-ng.com/<docsPath>.md` hint `createContext` uses — extract the
  `DOCS_BASE_URL` + hint formatting from `create-context.ts` into this module and reuse it there
  (single source for the docs-link convention).
- `rdxDevWarning` dedupes **per code per page load** (module-level `Set<string>`), replacing
  hand-rolled `warned` flags. A `resetRdxDevWarnings()` export (test-only) keeps specs honest.
- Existing call sites migrate: the portal misuse guards keep throwing but via `rdxDevError` with
  codes (`popover/portal-on-element`, …); the autocomplete warn-once effect drops its flag and
  calls `rdxDevWarning('autocomplete/virtualized-item-label', …)`.

This is the extension point: every future check below is one `rdxDevWarning` call, not a new
mechanism.

### 2. `HOST_TAG_NAME`-aware checks (warnings first, no behavior change)

`HOST_TAG_NAME` (stable since v19, unused in the repo) injects the host tag name in the
constructor — exactly where our primitives already do host-element work. Phase-2 checks, all
**warn-only**:

- **Triggers on non-interactive hosts.** `rdxSelectTrigger`, `rdxPopoverTrigger`,
  `rdxDialogTrigger`, `rdxMenuTrigger`, etc. on something that is neither `<button>` nor
  `<a>`/`<input>`: warn that keyboard activation and `role` are the consumer's responsibility
  (code `<name>/trigger-element`, link to the primitive's docs page where the anatomy shows
  `<button>`).
- **Label parts on non-labels.** `RdxLabelDirective` / `rdxFieldLabel` on a non-`<label>` element
  without an explicit association mechanism: warn (`field/unassociated-label`) — this encodes the
  project's hard a11y rule ("every visible label must be programmatically associated", CLAUDE.md)
  as a runtime check instead of a review-time convention.
- **Misuse-guard messages get tag-aware wording** ("found `<div rdxPopoverPortal>`") — cosmetic,
  rides along.

Implementation note: `inject(HOST_TAG_NAME)` throws on synthetic hosts; guard with
`inject(HOST_TAG_NAME, { optional: true })` wherever a part can legally sit on `ng-template` or a
component host. Checks must be cheap (constructor-time string compares) and must not read layout.

Explicitly deferred, not part of this ADR:\*\* _adaptive_ ARIA (automatically adding
`role="button"`/`tabindex="0"` on non-button triggers, as Base UI's render-prop components do).
That is a per-part behavior change with its own WAI-ARIA review and spec updates; if wanted, it
graduates from these warnings part-by-part in a follow-up.

### 3. `debugName` on the signals consumers actually inspect

Convention (added to `patterns.md` + the naming guide): state signals exposed through a root
context get `debugName: 'Rdx<Name>Root.<signal>'`. Sweep scope — deliberately narrow:

- root open/value/state signals (`open`, `value`, `disabled`, `orientation`,
  `transitionStatus`, highlighted-item signals);
- the `computed`s built inside `createContext` root-context factories where they exist;
- the long-lived `effect`s in roots and in shared machinery (`PresenceMachine`'s effect,
  `RdxPopperContentWrapper`'s position plumbing) — effects accept `debugName` too and are the
  hardest thing to attribute in DevTools traces.

Not swept: per-item signals (quantity makes names noise), story/demo code. The cost is a string
per signal in the bundle; accepted (matches Angular's own guidance — no conditional wrapping
gymnastics).

### 4. Docs

A short "Dev-mode diagnostics" section in the accessibility docs page (what warns, what throws,
that production builds are silent), plus the codes table generated by hand (it will be short).
`patterns.md` gets the `debugName` convention and the "new checks go through `rdxDevWarning`"
rule. CLAUDE.md gets one line in the a11y section. `pnpm skills:build` after the MDX change.

## Phases (separate PRs)

1. **Helper + migration of existing sites** (§1). Specs: warning dedupes per code, error throws
   with docs link, production mode (`isDevMode() === false` via TestBed teardown trick or direct
   unit test of the guard) emits nothing.
2. **Tag-aware checks** (§2) across trigger and label parts. Each check: one unit spec asserting
   the warning (spy on `console.warn`, use `resetRdxDevWarnings()`), one asserting silence on the
   correct element.
3. **`debugName` sweep + conventions** (§3, §4). No runtime assertions — review-driven; the
   patterns.md rule keeps future code consistent.

## Implementation notes (what shipped vs. the spec)

Building Phase 2 surfaced that the spec over-estimated how many parts need a _runtime_ host check —
most are already constrained statically, which is strictly better (compile-time, no bundle cost):

- **Trigger-element check applies to far fewer parts than enumerated.** `rdxSelectTrigger`,
  `rdxPopoverTrigger`, `rdxDialogTrigger`, `rdxDrawerTrigger`, `rdxComboboxTrigger`,
  `rdxAutocompleteTrigger`, `rdxNavigationMenuTrigger`, etc. are scoped to `button[...]` **selectors**,
  so a non-button host simply doesn't match — no runtime check needed. `rdxMenuTrigger` already
  **adapts** its ARIA (`nativeButtonState()` → `role="button"`/`tabindex` on non-button hosts), so a
  "your responsibility" warning would be wrong there. `rdxContextMenuTrigger` (any element) and
  `rdxMenuSubTrigger` (a `menuitem`, not a button) are excluded by design. The check ships only on the
  attribute-selector, interactive-host-assuming, non-adaptive triggers — **`rdxPreviewCardTrigger`**.
  `rdxTooltipTrigger` was deliberately **excluded**: it can legitimately sit on a focusable composite
  (the slider-thumb story puts it on a `<div>` wrapping the focusable `<input>`), where a tag-based
  check false-positives. The helper skips hosts that opt into focus with `tabindex`.
- **Label check applies only to `rdxFieldLabel`.** `RdxLabelDirective` is scoped to `label[rdxLabel]`
  (selector-enforced). `rdxFieldLabel` is attribute-selector and associates purely via `for`/`id`
  (Field has no `aria-labelledby` fallback), so on a non-`<label>` the association silently breaks —
  exactly the `field/unassociated-label` warning.
- **Phase 2 §2 third bullet (tag-aware wording on the portal misuse errors) was dropped** as
  low-value churn; the migrated `rdxDevError` codes already make those errors greppable.
- **Phase 3 `debugName` is rolling, not a single sweep.** Applied to the shared `PresenceMachine`
  effect and to `RdxPopoverRoot` (state computed + all five constructor effects) as the worked
  example the `patterns.md` convention points to; remaining roots adopt it as they're touched.
  `afterRenderEffect` (e.g. `RdxPopperContentWrapper`) was left alone — its options don't take a
  `debugName`.

## Rejected alternatives

- **A lint rule instead of runtime warnings.** Templates are consumer-side; our ESLint config
  doesn't run in consumer apps. Runtime dev-mode checks are the only channel that reaches the
  actual audience (same reasoning as the ADR 0010 misuse guards).
- **Error-code registry with docs anchors per code (`radix-ng.com/errors/RDX0123`).** Over-built
  for a library this size; the `<primitive>/<slug>` codes are greppable and the docs link already
  lands on the right page.
- **Wrapping `debugName` in `ngDevMode` conditionals to save bytes.** Strings this small are not
  worth the noise at every signal declaration.

## Consequences

- One way to add a check; new primitives inherit the discipline via the patterns.md rule.
- The two most common consumer mistakes in a headless library (wrong trigger element,
  unassociated label) stop failing silently.
- DevTools sessions show `RdxSelectRoot.open` instead of anonymous nodes — cheap, permanent
  debugging win for both consumers and maintainers.
- Production bundles stay silent and (modulo `debugName` strings) size-neutral.
