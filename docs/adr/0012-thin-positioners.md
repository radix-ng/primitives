# ADR 0012: Thin positioners — single-source popper inputs, unified CSS variables, z-index decoupling

- Status: Accepted
- Date: 2026-06-13
- Decision owners: Radix NG maintainers
- Related: ADR 0002 (popper arrow Base UI alignment), ADR 0010 (anatomy flattening),
  `packages/primitives/popper/src/popper-content-wrapper.ts`,
  `packages/primitives/popper/src/popper-content.config.ts`,
  every `<name>-positioner.ts` under `packages/primitives/*/src/`

## Context

### The cost of describing a primitive

After ADR 0010 the _anatomy_ is at Base UI parity, but _authoring_ a popup primitive still pays a
heavy per-primitive tax in its positioner. The 9 positioner directives (autocomplete, combobox,
menu, navigation-menu, popover, preview-card, select, toast, tooltip) total **~1,045 lines**, and
most of that is three layers of copy-paste around `RdxPopperContentWrapper`:

1. **Re-declared inputs.** Each positioner re-declares the same ~11 positioning inputs (`side`,
   `sideOffset`, `align`, `alignOffset`, `arrowPadding`, `avoidCollisions`, `collisionBoundary`,
   `collisionPadding`, `sticky`, `hideWhenDetached`, `updatePositionStrategy`), with duplicated
   JSDoc, **purely for documentation** (compodoc/ArgTypes) — at runtime the values flow through the
   `hostDirectives` forwarding into the wrapper's own inputs; the re-declared signals are read by
   nothing.
2. **The `hostDirectives` forwarding array** listing those same ~11 names again.
3. **CSS custom-property re-namespacing.** Each positioner re-exports the wrapper's
   `--radix-popper-*` variables under primitive-specific names
   (`--radix-combobox-content-available-height`, `--radix-select-content-transform-origin`, …) in
   a copy-pasted `[style]` block. ADR 0010's inventory already caught one casualty of this pattern
   (select shipping `--radix-tooltip-content-*` for months).

### The drift bug class (found, live on main)

Because the re-declared inputs are documentation-only, their declared defaults silently diverge
from runtime. Runtime defaults come from the wrapper
(`this.config.side ?? 'bottom'`, `this.config.align ?? 'center'`, `sideOffset ?? 0`, …) where
`config` is `RdxPopperContentConfigToken` — and only tooltip, popover, menu, navigation-menu,
preview-card, and toast provide it. **Combobox, autocomplete, and select do not.** Concretely:

| Positioner   | Declares (docs/ArgTypes)            | Actual runtime default               |
| ------------ | ----------------------------------- | ------------------------------------ |
| combobox     | `sideOffset = 4`, `align = 'start'` | `sideOffset = 0`, `align = 'center'` |
| autocomplete | `sideOffset = 4`, `align = 'start'` | `sideOffset = 0`, `align = 'center'` |
| select       | `align = 'start'`                   | `align = 'center'`                   |

(Masked in demos because stories bind these inputs explicitly.) The generated
`api-contract.json` — what LLM consumers read — publishes the wrong defaults.

### Two more couplings worth removing

- **z-index copying.** `RdxPopperContentWrapper` holds
  `contentChild.required(RdxPopperContent, { read: ElementRef })` solely to copy the _popup's_
  computed `z-index` onto the positioner (`contentZIndex` → `style()`). This hard-requires an
  inner `RdxPopperContent` (crashes without one), reads `getComputedStyle` during change
  detection, and is the inverse of Base UI's contract (z-index belongs on the Positioner; the
  popup needs none).
- **Unified vs legacy CSS variables.** Popover's positioner already exposes the Base UI-style
  names (`--anchor-width`, `--anchor-height`, `--available-width`, `--available-height`,
  `--positioner-width`, `--positioner-height`, `--transform-origin`) _alongside_ its legacy
  `--radix-popover-*` aliases; every other positioner exposes only its legacy
  `--radix-<name>-content-*` set. Consumers styling two different primitives must learn two
  variable dialects for the same concept.

## Decision

### 1. The wrapper emits the unified variables and placement attributes itself

`RdxPopperContentWrapper` gains host bindings (it already binds `[style]` and
`data-radix-popper-content-wrapper`):

- CSS variables, emitted once for everyone: `--anchor-width`, `--anchor-height`,
  `--available-width`, `--available-height`, `--positioner-width`, `--positioner-height`,
  `--transform-origin` (sourced from the existing `--radix-popper-*` values it computes; the
  internal `--radix-popper-*` names stay as the engine-level source).
- Placement state, emitted once: `[attr.data-side]`, `[attr.data-align]` (from
  `placedSide()`/`placedAlign()`), `[attr.data-anchor-hidden]` (from `anchorHidden()`).
  `RdxPopperContent` keeps its own `data-side`/`data-align` (popup-level styling hooks, Base UI
  has them on Popup too).

Per-primitive positioners then **delete their re-namespacing `[style]` blocks**. The legacy
`--radix-<name>-content-*` names are kept for one release as deprecated aliases — emitted from a
single shared helper (`legacyPopperVars('<name>')` in `popper`) rather than hand-written maps — and
removed in the next minor. The theming/styling docs document only the unified set.

### 2. Positioners extend the wrapper instead of composing it

Replace the hostDirectives-forwarding pattern with class inheritance:

```ts
@Directive({
  selector: '[rdxComboboxPositioner]',
  exportAs: 'rdxComboboxPositioner',
  providers: [
    // Children (popup, arrow) and the wrapper context resolve the base class token.
    { provide: RdxPopperContentWrapper, useExisting: RdxComboboxPositioner },
    provideRdxPopperContentConfig({ sideOffset: 4, align: 'start' })
  ]
})
export class RdxComboboxPositioner extends RdxPopperContentWrapper {}
```

What this buys:

- Inputs, outputs (`placed`), host bindings, and JSDoc are **inherited** — declared once, on the
  wrapper. The ~11 duplicated input declarations, their forwarding array, and the drift bug class
  all disappear; a primitive's positioner is ~15 lines.
- One instance instead of two (today the outer directive + the host-directive wrapper coexist,
  with the outer's input signals as dead weight).
- Positioners with real behavior keep it as additions in the subclass — popover's grace-area
  wiring and `anchor` handling, tooltip's cursor-following — on top of the inherited surface.
- Per-primitive _defaults_ are expressed only via `provideRdxPopperContentConfig(...)` — the same
  mechanism six primitives already use — so docs and runtime cannot diverge. Combobox,
  autocomplete, and select gain config providers matching their currently _documented_ defaults
  (`sideOffset: 4`/`align: 'start'` for combobox+autocomplete; `align: 'start'` for select); this
  intentionally changes runtime behavior for consumers who relied on the undocumented actual
  defaults — audit stories for unbound usage and let the visual baselines arbitrate.

**Tooling gate (Phase 1 spike):** the generated docs pipeline must show inherited members —
verify that compodoc's `documentation.json` (and therefore Storybook ArgTypes and
`api-contract.json` via `tools/scripts/skills/api-contract.mjs`) lists inherited inputs for an
`extends`-based positioner. compodoc records inheritance; if the API-contract script only reads
own members, teach it to walk `extends` chains — fix the script, do not fall back to re-declaring
inputs. Also respect the known compodoc landmine: no inline-arrow transforms with union-literal
generics anywhere in the touched files.

`RdxPopperContentConfigToken` resolution must keep working with a single class: the subclass
_provides_ the config and the inherited constructor _injects_ it — same-injector
provider-then-inject is fine since the config lives on the positioner's own `providers`.

### 3. Drop the z-index copy / inner-content requirement

Remove `contentChild.required(RdxPopperContent)`, `contentZIndex`, and the `zIndex` entry from
the wrapper's `style()`. Contract change, Base UI-aligned: **set `z-index` on the positioner**.
Migration notes (changelog + styling guide + theming docs): consumers who set z-index on the popup
and relied on the positioner inheriting it now move that utility class one element up. In-repo:
sweep `storybook/styles.ts` and stories for popup-level `z-*` classes whose value was load-bearing
through the copy (dialog/drawer surfaces set `z-50` directly on their fixed popups — unaffected;
this concerns popper-positioned primitives only). After this, a positioner no longer _requires_ an
inner `RdxPopperContent` to exist — the query crash goes away.

## What this does NOT change

- The positioning engine itself: `resource`-driven `computePosition`, the `linkedSignal`
  anti-flicker hold, `autoUpdate` wiring, middleware order — all untouched (the
  reactive-resource-as-primary / autoUpdate-as-secondary behavior in zoneless is a separate
  investigation, not this ADR).
- Anatomy: positioner and popup remain two consumer-owned elements (ADR 0010 / Base UI parity).
- `RdxPopperContent` and arrow handling (ADR 0002).

## Phases (separate PRs)

1. ✅ **Spike: docs pipeline vs inheritance — DONE, gate PASSED.** Combobox positioner converted to
   `extends RdxPopperContentWrapper` (57 → 26 lines) + `provideRdxPopperContentConfig({ sideOffset: 4,
align: 'start' })`. Added a `provideRdxPopperContentWrapper(positioner)` helper to `popper` for the
   `useExisting` alias + context provider (Angular does not inherit a base directive's `providers`).
   Findings: **compodoc already flattens inherited inputs** into `inputsClass` (with an
   `inheritance: { file }` marker) — no `extends`-chain walk needed. The real gap was **defaults**:
   inherited inputs report the base expression `this.config.<key> ?? <fallback>` and ignore the
   positioner's config override. Resolved in **two** docs surfaces with the same small parser
   (reads `provideRdxPopperContentConfig({...})` from the entry's `sourceCode`, gated on
   `extends.includes('RdxPopperContentWrapper')`): `tools/scripts/skills/api-contract.mjs` (for
   `api-contract.json`) and the Storybook `plugins/compodoc.ts` (for ArgTypes). Verified: combobox
   publishes `sideOffset: 4`/`align: 'start'`; the bare wrapper resolves to clean `0`/`'center'`;
   ArgTypes no longer leaks `this.config`. Combobox unit (13 specs) + `combobox.behavior` green;
   `primitives:build` + `build-storybook` green. NB this also enacts combobox's intended runtime
   default change (no story bound `sideOffset`/`align`, so all popups move to `4`/`'start'` — the
   documented values); combobox has no open-state visual baseline, so nothing to re-baseline.
2. ✅ **Wrapper emits unified vars + placement attrs (§1) — DONE.** `RdxPopperContentWrapper` now
   emits the unified `--anchor-*` / `--available-*` / `--positioner-*` / `--transform-origin` vars in
   its `style()` and binds `[attr.data-side]` / `[attr.data-align]` / `[attr.data-anchor-hidden]` on
   its host — so every positioner gets them for free. popover / preview-card / navigation-menu dropped
   their hand-written `[style]` maps + duplicate placement-attr bindings (kept popover/preview-card's
   `data-open`/`data-closed`/`data-instant`). Added a `legacyPopperVars(name)` helper to `popper`;
   popover/preview-card spread it into `[style]` to keep their deprecated `--radix-<name>-*` aliases
   for one release (these are unused in-repo but kept for external back-compat); navigation-menu had
   none. Note: Angular allows the redundant host bindings, so menu/tooltip/toast (which also bind
   `data-side`) still compile and run — their own bindings become redundant and are removed when those
   positioners convert in Phase 3. Verified: `overlays.visual` popover screenshot **unchanged** (var
   equivalence), popover/preview-card/navigation-menu behavior green, and a DOM check confirms the
   wrapper emits `data-side`/`--anchor-width`/`--transform-origin` while the helper emits the legacy
   alias. Only `--radix-select-trigger-width` is consumed in-repo (select-object-values story) — select
   is Phase 3, so its positioner is untouched here.
3. ✅ **Inheritance conversion (§2) — DONE.** All 9 positioners now `extends RdxPopperContentWrapper`
   (combobox in Phase 1; autocomplete, select, popover, preview-card, navigation-menu, tooltip, menu,
   toast here). Total positioner LOC **1045 → 409 (−61%)**. Mechanics: each spreads
   `provideRdxPopperContentWrapper(Self)` (useExisting + context, since `providers` aren't inherited)
   - `provideRdxPopperContentConfig(...)`; behavior subclasses (popover/preview-card grace-area,
     navigation-menu, tooltip cursor-follow + dismissable-layer, select's `RdxPositionerImpl` token,
     toast's own `RdxPopper`) keep their logic and call `super()`. Removed the now-redundant
     `data-side`/`data-align` from menu/tooltip/toast (the wrapper emits them). **Breaking default
     changes (combobox/autocomplete/select only, per §2):** combobox+autocomplete → `sideOffset: 4`,
     `align: 'start'`; select → `align: 'start'` + `updatePositionStrategy: 'always'`. All other
     positioners are **behavior-preserving** — their existing config is kept verbatim, so the
     api-contract now publishes the _truthful_ runtime default (e.g. menu `align: 'center'`, tooltip
     `updatePositionStrategy: 'optimized'`) instead of the old dead re-declared doc value. Verified:
     build + lint + unit (all converted packages) + SSR green; `overlays.visual` (popover/tooltip/menu/
     **select**/context-menu open) unchanged — select's `center→start` shift is invisible because its
     popup matches the trigger width (`min-w-[--radix-select-trigger-width]`); combobox/autocomplete have
     no open-state baseline (their 4px/align shift is the documented fix). `api-contract.json` defaults
     now match every config exactly (the drift-bug regression test). No theming docs referenced these
     vars, so no doc churn.
4. ✅ **z-index decoupling (§3) — DONE.** Removed `contentChild.required(RdxPopperContent)`,
   `contentZIndex`, and the `zIndex` entry from the wrapper's `style()` (plus the now-unused
   `isBrowser`/`PLATFORM_ID`/`isPlatformBrowser`/`RdxPopperContent` imports). z-index now lives on the
   positioner. In-repo sweep: moved `z-50` from popup→positioner in `demoCombobox` (combobox +
   autocomplete) and `z-[100]` popup→positioner in the 4 popper-mode select stories (the 2
   item-aligned stories were never copied — left alone). Migration note added to
   `storybook/styling.docs.mdx` (the section that taught the inverse now documents the new contract +
   an ADR-0012 migration callout) and CLAUDE.md. Verified: build + lint + unit (popper/select/
   combobox/autocomplete/tooltip) green; `overlays.visual` (all open overlays) + behavior specs (33)
   **unchanged** — popover/tooltip/menu/nav-menu positioners that previously had their `z-50` class
   silently overridden to the popup's `auto` now correctly apply `z-50`, but single-overlay stacking
   is identical (fixed + last-in-body). The positioner no longer requires an inner `RdxPopperContent`
   — the `contentChild.required` open-time crash is gone.

## Testing

- Visual-regression baselines are the primary arbiter for §1 (var equivalence) and the new config
  defaults (any unbound story shifts by 4px / re-aligns — each diff is reviewed as either the
  intended doc-matching fix or a story that should bind explicitly).
- Per-positioner unit specs keep passing with templates unchanged (selectors/API are unchanged).
- A dedicated spec for the inheritance pattern: child instance resolves via the
  `RdxPopperContentWrapper` token (arrow + popup + wrapper context all find it), config defaults
  apply, `placed` output fires.
- `pnpm skills:build` diff is part of review for every phase: defaults in `api-contract.json`
  must match the config providers exactly (this is the regression test for the drift bug class).

## Rejected alternatives

- **Shared exported `POPPER_POSITIONER_INPUTS` array + keep hostDirectives.** Kills layer 2 only;
  the documentation inputs (layer 1, the drift source) would have to stay for ArgTypes. Inheritance
  removes the duplication at the root.
- **Keep doc-inputs but sync defaults by hand.** That is the current state; it demonstrably
  drifts.
- **Unified vars per-primitive via copy-paste of popover's block.** Multiplies the maintenance
  surface ADR 0010's `--radix-tooltip-*`-in-select bug came from; emit once at the source instead.

## Consequences

- A new popup primitive's positioner drops from ~150 lines to ~15; defaults live in exactly one
  place; published API contracts stop lying about defaults.
- One consumer-facing CSS variable dialect (`--anchor-*`, `--available-*`, `--transform-origin`),
  matching Base UI docs 1:1 — Base UI examples become copy-pasteable.
- Two deliberate breaking changes, each isolated in its own phase with migration notes: runtime
  defaults for combobox/autocomplete/select align to documented values; z-index moves to the
  positioner.
- CLAUDE.md, styling/theming guides, and the skills bundle update in the same PRs that change
  behavior.
