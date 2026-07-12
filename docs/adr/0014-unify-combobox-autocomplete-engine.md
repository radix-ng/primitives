# ADR 0014: Unify Combobox & Autocomplete on one engine (combobox is the engine for autocomplete)

- Status: Accepted (P0–P6 done — shared engine, both roots thin, parts parity, native forms)
- Date: 2026-06-13
- Decision owners: Radix NG maintainers
- Related: `packages/primitives/combobox/src/combobox-root.ts`,
  `packages/primitives/autocomplete/src/autocomplete-root.ts`, ADR 0012 (thin positioners —
  precedent for "extends + provide-helper re-wiring"), ADR 0013 (dev diagnostics — `rdxDevWarning`
  already lives in `autocomplete-root`). Base UI references:
  [`Combobox`](https://base-ui.com/react/components/combobox),
  [`Autocomplete`](https://base-ui.com/react/components/autocomplete).

## Context

In Base UI, **Autocomplete is Combobox**: the same store/engine, configured with
`selectionMode="none"` and inline-completion behavior, reusing the same `Combobox.*` parts. Grid
navigation, inline completion, filtering, and highlight live in the one Combobox engine; Autocomplete
is a preset on top.

We diverged. We have **two parallel root directives** that re-implement the same engine:

- `combobox-root.ts` — ~953 lines.
- `autocomplete-root.ts` — ~988 lines.

`RdxAutocompleteRoot` does **not** `extends RdxComboboxRoot`; it is a separate directive that
re-provides the same `RdxComboboxRootContext` (so the combobox parts work inside it) and re-implements
the engine, **adding** inline completion and grid. The dependency direction is already correct
(`autocomplete` → `combobox`; combobox never imports autocomplete), but the engine itself is copied,
not shared.

### Measured duplication (the shared engine, ~70% of both files, identical or near-identical)

Item registry (`_items`, `registerItem`/`unregisterItem`, `orderedItems` DOM sort) · filtering
(`visibleItems`, `visibleSet`, `filteredItems`, `visibleCount`, `matchesFilter`, `textFor`,
`useFilter`) · highlight (`useListHighlight`, `highlightedItem`/`Index`, `highlightReason`, `activeId`,
the `highlightFirst/Last/Index/set/clear` facade, `stepIndex`) · the `pendingHighlightEdge` machine +
its apply-effect · transitions (`useTransitionStatus`, `transitionStatus`, `registerTransitionElement`)
· the shared effects (highlight-emit, autoHighlight-`always`, virtualized self-heal, dev-warning) ·
`keyboardActive` · `setOpen`/`closePopup`/`selectInputText`/`itemId`/`selectHighlighted`/`selectIndex`
· `triggerElement`/`focusInput`/`restoreFocusAfterSelect` · CVA boilerplate ·
`cvaDisabled`/`disabledState`/`requiredState` · most inputs
(`dir`/`disabled`/`loopFocus`/`autoHighlight`(+mode)/`highlightItemOnHover`/`keepHighlight`/`modal`/
`submitOnItemClick`/`filter`/`limit`/`items`/`virtualized`/`by`/`openOnInputClick`/`defaultOpen`/`open`)
· outputs (`onOpenChange`/`onItemHighlighted`/`onOpenChangeComplete`).

**Combobox-only:** `value` as single/array, separate `inputValue` model, `multiple`/`selectionMode`/
`mode`, chips (`removeValue`/`removeLastValue`/`focusLastChip`/`registerChipsNav`),
`handleSelectValue` (multiple toggle + label-on-select), `setLabel`/`revertInputValue`,
`fillInputOnItemPress`, array-aware `isSelected`, `itemToStringLabel`.

**Autocomplete-only:** `value` **is** the input string (`inputValue === value`), always
`selectionMode:'none'`; **inline completion** (`inlinePreview`/`displayValue`/`recomputeInlinePreview`/
`suppressInline`/`firstMatchItem`/`'first-match'` edge); **grid** (`grid`, `moveRight`/`moveLeft`,
`gridVertical`, `gridRows`); `query` from `typed`+`value`; `onValueChange` with `reason`;
`itemToStringValue`.

Net: `autocomplete-root` = **the same engine** + inline + grid + "value is a string" semantics — which
is exactly what Base UI keeps inside the one Combobox engine. The two-root split is also the structural
reason features (grid, `data-empty`, clear/readOnly semantics) have drifted apart between the two.

## Decision

Extract a single shared engine into the `combobox` package and have both roots consume it. The engine
is a **hook factory** `useComboboxEngine(config)` run in an injection context — matching this
codebase's established `use*` convention (`useListHighlight`, `useFilter`, `useTransitionStatus`,
`useArrowNavigation`). Both roots become thin: create the engine, map their inputs into its config,
provide `RdxComboboxRootContext` from it.

**Why a hook, not `class AutocompleteRoot extends ComboboxRoot`:** Angular directives don't inherit
`providers`/`host`/`inputs` cleanly across different selectors (we'd need ADR-0012-style re-wiring),
and the two input sets genuinely diverge (`itemToStringValue` vs `itemToStringLabel`; `mode`/`grid`/
`readOnly`; string vs `ComboboxValue`). A hook factory is lower-risk and idiomatic here.

Grid and inline completion move **into the engine** (gated by config), so grid becomes a Combobox
capability too (Base-UI-aligned), and Autocomplete stops owning a private copy.

The engine instance is kept private to each root (a `#`/`private` field read by the context factory via
a module `WeakMap`) and exposes only readonly signals + explicit setters — mirroring Base UI, where
`AriaCombobox`/the store are internal and `ComboboxRoot`/`AutocompleteRoot` are thin adapters. The
factory `useComboboxEngine` is exported from the combobox entry **`@internal`** solely so the
autocomplete entry can build on it (ng-packagr secondary entries can't share unexported code); the
`ComboboxEngine` / `ComboboxEngineConfig` types stay unexported (autocomplete types its field via
`ReturnType<typeof useComboboxEngine>`). It is not part of the public, stability-guaranteed API. The `filter` prop on **both**
roots adopts Base UI's signature **shape** `(itemValue, query, itemToString?) => boolean` (value-first,
text resolver) — no intermediate legacy contract. Two deliberate, documented deviations from Base UI's
exact runtime behavior:

- We always pass a **defined** `itemToString` resolver, whereas Base UI forwards `itemToStringLabel`
  which may be `undefined`. The signature keeps it optional (`?`) for source-compatibility, but a
  custom filter here can rely on it being present — a superset, not a drop-in identical contract.
- The resolver is **DOM-aware** (resolves a value to a mounted item's text), where Base UI's is the
  value→string prop. This is what makes one filter work for our DOM-driven _and_ virtualized lists.

`isItemEqualToValue` likewise matches Base UI by **name and the function form** only — our input is a
superset: it also accepts a **string key** (`isItemEqualToValue="id"`, our `by` shorthand) and its
default is **deep equality**, where Base UI is function-only and defaults to `Object.is`. Passing a
comparator function is Base-UI-identical; the string shorthand and value-equality default are
documented extensions, not parity. (If strict reference-equality parity is ever required, that's a
separate, explicit change to the default.)

Plus two notes:

- The **deferred-highlight cleanup** (clearing a pending open-edge highlight on close) is a correctness
  fix to _our_ signal state machine, **not** a Base UI parity gap — upstream drives this through
  `useListNavigation`, so the mechanics differ by design.
- Base UI also exports `useFilter` / `useFilteredItems` and accepts a controlled `filteredItems` prop.
  Only `useFilter` exists here today; `useFilteredItems` and controlled `filteredItems` are **new APIs**
  deferred to P3/P5, not P1.

## Base UI parity inventory

Consolidates the external review (2026-06-13) with earlier findings (Clear alignment, `data-empty`,
grid placement). Each gap is tagged with the phase that closes it. **Severity** is the reviewer's.
"Bug" = wrong vs Base UI today regardless of the refactor; "Parity" = missing/renamed API or behavior.

| #   | Sev    | Gap                                                                                                                                                                                                                                                                                                   | Kind               | Phase                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | High   | `readOnly`/`disabled` don't block value mutation via Clear, ChipRemove, Backspace/Delete (`clearSelection`/`removeValue`/`removeLastValue` skip the guard)                                                                                                                                            | Bug                | **P1** — closed structurally at the single guarded `commit`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2   | High   | Deleting all input text should reset single selection and (when `openOnInputClick=false`) close the popup; we always open and only change `inputValue`, keeping the selection                                                                                                                         | Bug / behavior     | **P1 done** (single deselect + popup-close on empty)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 3   | High   | Missing Root API / native-form contract: `name`, `form`, `itemToStringValue`, `defaultInputValue`, `autoComplete`, controlled `filteredItems`, `grid`, `inline`, `locale`; `isItemEqualToValue` vs our `by`; `readOnly` vs our `readonly`; `filter(text)` vs `filter(itemValue, query, itemToString)` | Parity             | grid→**P2 done**, inline→P3, filter signature `(itemValue, query, itemToString?)`→**P1 done**, renames `readonly`→`readOnly` / `by`→`isItemEqualToValue`→**P1 done**, native-form (`name`/`form`)→**P6 done**                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 4   | Medium | Missing public parts: `InputGroup`, `Row`, `Collection`, `Separator`; `useFilter`/`useFilteredItems` exports                                                                                                                                                                                          | Parity             | `Row`→**P2 done**; `useFilter` re-export→cheap (P1); `InputGroup`/`Separator`/`Collection`→P5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 5   | Medium | Chips: ArrowLeft/Right ignore `dir` (RTL); container `role="list"` vs Base UI `role="toolbar"` (NVDA focus mode)                                                                                                                                                                                      | Bug (RTL) / Parity | **P5 done** — chips `role="toolbar"`, chip no-role, `dir`-aware arrow nav                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 6   | Medium | Selection should be `click`-driven (Base UI: works for programmatic clicks too) plus a conditioned `mouseup` drag-end over the **highlighted** item; a right-click or a bare `mouseup` must not select                                                                                                | Bug                | **P2 done** — Base UI model: `click` commits a press+release on the item and a programmatic click; `mouseup` is the drag-end fallback that commits the **highlighted** item only when the press began on a **different** element (so `click` won't fire) — a press on the item itself is skipped there (no double-commit). The press flag is read-and-reset at the start of `mouseup` (and on popup close), so a press+release doesn't block a later drag-end. Right-click and a mouseup over a non-highlighted item don't select. The earlier armed-item/document-capture approach was dropped as over-strict. Covered by combobox + autocomplete specs. |
| 7   | Low    | Missing part props / live-region attrs: `Input.disabled`, `Clear.disabled`/`keepMounted`, `ItemIndicator.keepMounted`, `Portal.keepMounted`, `aria-atomic="true"` on `Status`/`Empty`                                                                                                                 | Parity             | **P5 done** for `aria-atomic` (Empty/Status live regions) + `Clear.disabled`; `keepMounted` / `Input.disabled` deferred (architecture / redundant)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

Earlier-closed items (this branch): Clear visibility/`none`-mode + highlight reset + `preventDefault`
(done); `RdxComboboxList` `data-empty` (done); chip↔list ArrowDown/Up nav (done).

## Phased plan

Each phase ships independently and stays green. **The library is in beta, so breaking changes are
allowed** — make a rename / signature change in the phase where it's natural (don't defer to a batch).
Record each break with a **breaking-commit (`!`) message**; the release tooling (`nx release`)
generates the CHANGELOG entry from it (the `CHANGELOG.md` is generated, not hand-edited). Add a codemod
/ migration note only where a rename isn't mechanical. The only hard "don't break it yet" is _within_ a
phase: a phase must not regress behavior it isn't intentionally changing (that's what the P0
characterization tests guard).

- **P0 (this ADR, done): inventory + safety net.** This document; a characterization-test pass pinning
  the _correct_ engine behaviors before any code moves (see "Test strategy"). Genuine bugs (Findings 1, 6) are deliberately **not** pinned as-is — they are deferred to P1, fixed there, then pinned.
- **P1 (done): extract `useComboboxEngine` + Root API alignment.** New
  `packages/primitives/combobox/src/combobox-engine.ts`. Moved the shared engine and rebuilt
  `RdxComboboxRoot` on it (engine private, readonly signals). **No behavior change outside the listed
  bug fixes and intentional breaking API changes** — the P0 characterization specs stayed green.
  Scoped changes landed: centralized value mutation behind one guarded `commit` (closed Finding 1);
  the deleting-to-empty single-deselect + popup-close semantics (Finding 2); and the Base-UI
  renames/signatures on **both** roots — `readonly`→`readOnly`, `by`→`isItemEqualToValue`, and Base
  UI's `filter(itemValue, query, itemToString?)` signature (value-first, with a DOM-aware text
  resolver). Each break is captured by the breaking-commit (`!`) convention the release tooling reads.
- **P2 (done): grid in the engine (Combobox feature).** Engine `grid` config + `gridVertical`/
  `gridRows`/column moves parameterized by a `rowOf(el)` resolver; `highlightNext`/`highlightPrevious`
  are grid-aware and `highlightNextColumn`/`highlightPreviousColumn` added; new `RdxComboboxRow`
  (`role="row"`); `RdxComboboxList` switches to `role="grid"`; `combobox-input` maps `ArrowLeft`/
  `ArrowRight` to column moves in grid mode. Autocomplete keeps its own grid until P4. (Finding 4 Row,
  Finding 3 grid.) Items **inside a `RdxComboboxRow`** expose `role="gridcell"` (else `role="option"`, so a stray
  item under a grid list stays valid), and the input advertises `aria-haspopup="grid"` (else
  `"listbox"`) — on both combobox and autocomplete.
- **P3 (done): inline completion in the engine (gated by `inlineMode`).** The engine owns
  `inlinePreview` + the recompute effect, `firstMatchItem` / `firstVisibleNavigable`, the `'first-match'`
  pending edge, `setSuppressInline` / `clearInlinePreview`. Combobox passes `inlineMode = signal(false)`
  (the inline effect no-ops). (Finding 3 inline.)
- **P4 (done): Autocomplete root → thin config over the engine.** `RdxAutocompleteRoot` now creates a
  private `useComboboxEngine` (read by its context factory via a `WeakMap`, like combobox) and delegates
  registry / filtering / highlight (grid) / inline / transition to it — the ~600-line duplicated engine
  is gone. The root keeps only the string-value semantics: `value` **is** the input string, `query`
  (`typed` + `value`), `mode` → `filteringEnabled` / `inlineMode`, `displayValue`
  (`engine.inlinePreview() ?? value()`), `onValueChange` with `reason`, `selectionMode:'none'`,
  commit/clear. The divergences stay intentional: `openOnInputClick` default (false vs true),
  `closePopup` revert (`typed=false` + clear preview), `clearValue` vs combobox `clearSelection`. All 65
  autocomplete specs + SSR pass on the shared engine. (The earlier sketch's separate `valueAdapter`
  object was folded into the root's own inputs/methods — same role, less indirection; the engine stays
  value-agnostic, reaching string state only through the configured `query` signal and `itemToString`.)
- **P5 (done): parts parity.** Chips `role="toolbar"` + chip no-role + `dir`-aware arrow nav (and the
  input's step-into-chips key flips in RTL) — Finding 5. `RdxComboboxEmpty` / `RdxComboboxStatus` are
  polite **atomic live regions** (`role="status"` + `aria-live` + `aria-atomic`, Base-UI-aligned) and
  `RdxComboboxClear` gains a `disabled` input — Finding 7. New parts `RdxComboboxInputGroup`
  (state-mirroring wrapper) and `RdxComboboxSeparator` (`role="separator"`); autocomplete reuses both via
  `hostDirectives`. **Deferred with rationale:** `Collection` (Base UI's function-as-children render
  optimization — no equivalent in Angular's `@for` templates); `keepMounted` on Clear / ItemIndicator /
  Portal (mount lifecycle is owned by our presence/portal machine, not a per-part prop); `Input.disabled`
  (redundant — the input already derives `disabledState` from the root + Field).
- **P6 (done): native-form contract.** `name` / `form` / `itemToStringValue` serialize Combobox and
  Autocomplete through the shared native-form adapter, including external-form association, disabled
  exclusion, and native reset (Finding 3).

Breaking renames (`readonly`→`readOnly`, `by`→`isItemEqualToValue`, the `filter` signature) land in
the phase that touches that surface (P1/P3/P4), not a deferred batch — we're in beta. Each break gets a
CHANGELOG entry; offer an input alias only where it's nearly free.

## Test strategy (the P0 safety net)

The refactor moves engine code between two directives; the guard is that **behavior is pinned before
the move**. Both suites are already strong (combobox: 13 spec files; autocomplete: 9). The audit below
lists engine-touching behaviors that are currently **unpinned** and must be characterized first —
limited to behaviors that are _correct today_ (so they're safe to lock):

| Engine behavior                                                    | Combobox          | Autocomplete                           |
| ------------------------------------------------------------------ | ----------------- | -------------------------------------- |
| `loopFocus=false` boundary stop (no wrap at ends)                  | missing           | missing                                |
| ArrowUp opens & highlights the **last** item                       | missing           | covered (ArrowDown→first only? verify) |
| `limit` caps visible items + nav stays within                      | covered           | **missing**                            |
| `onItemHighlighted` emits value/index/reason                       | covered           | **missing**                            |
| virtualized self-heal (filter shrinks past index clears highlight) | covered           | **missing**                            |
| grid wrap at edges (loop) + column clamp to a shorter row          | n/a (no grid yet) | **missing** (only down/up/select)      |

Bugs surfaced by the review are handled separately: Findings 1 & 6 get fixed + a new regression test
each (browser-level for the pointer-button case — jsdom can't see `event.button`), _not_ a
characterization of the current wrong behavior.

Layers used: Vitest unit (zoneless) for engine logic; `apps/visual-regression` for anything needing
real focus/layout (chip↔list nav, pointer buttons); SSR pages must keep compiling against the public
API; `radix-perf` benches unaffected.

## Risks / constraints

- **Zoneless/signals:** the engine runs through `effect`/`computed` with an explicit `injector` (like
  the existing hooks). No `ngOnInit`/`ngOnChanges`/`ngOnDestroy` (ESLint-enforced in primitive `src`).
- **compodoc gotcha:** never combine an inline `transform` arrow with union-generic `input()` args —
  keep named module-level transforms (both roots already do).
- **Beta → breaking allowed.** No need to freeze the public API or alias every rename; align names to
  Base UI in-phase with a CHANGELOG note. Parity of _unintentional_ behavior is still proven by P0 tests.
- **No new cycles:** the engine lives in `combobox`; `combobox` must not import `autocomplete`.
- **Preserve the divergences:** the subtle per-primitive differences (revert behavior, `inlinePreview`,
  `openOnInputClick` default, `selectionMode:'none'`) are the most common merge-regression source —
  they live in config/adapter, never get flattened away.

## Alternatives considered

- **`AutocompleteRoot extends ComboboxRoot`.** Rejected: directive metadata (`providers`/`host`/
  `inputs`) doesn't inherit across selectors without ADR-0012-style re-wiring, and the input sets
  diverge — leaky and higher-risk than a hook.
- **Move the engine to `core`.** Rejected: the engine is combobox-specific (`ComboboxItemRef`, the
  context shape). `combobox` is the right home; autocomplete already depends on it.
- **Leave two roots, only port `grid` down.** Rejected as the end state: it fixes one symptom while the
  duplicated engine keeps drifting (this ADR exists because it already has).

## Deferred follow-ups (review batches, 2026-06-13)

Tracked here from the post-P5 Base-UI parity reviews. All **confirmed correctness** findings are
already fixed (read-only mutation guard, Empty live region, `aria-selected` omitted in `selectionMode:'none'`,
`highlightReason` reset on DOM self-heal, trigger `inputLayout` contract + keyboard-open, popup
`role`/`tabindex` + focus handoff, Escape-on-closed clear via `popupMounted`, whitespace-trim open,
touch focus parking, `restoreFocusAfterSelect` consumer-focus respect, list `tabindex`/Enter + grid
Home/End, group-label cleanup, backdrop `role="presentation"`, arrow `aria-hidden`). The items below are
**deliberately deferred**, not forgotten — revisit as a batch.

**Behavioral nuances (Low):**

1. **`Label` associates with both Input and Trigger.** Kept as a harmless superset — the focusable
   control in each layout (Input when editable, Trigger when `inputLayout==='inside'`) is labelled
   correctly; the other association sits on a non-focusable element. Strict Base UI parity = gate the
   trigger's `aria-labelledby` on `inputLayout==='inside'`. Decide whether the superset is acceptable.
2. **`Group` auto-sets `[hidden]` when all its items are filtered out.** Useful default (no heading over
   an empty section) but an undocumented behavioral superset over Base UI, which never self-hides the
   group. Consider an opt-out input for custom in-group empty states.
3. **`ItemIndicator` is always mounted and toggled via `[hidden]`.** Base UI omits the indicator for
   unselected items by default; `keepMounted` opts into permanent DOM + transition states. Exact parity
   is tied to our presence/portal mount model — deferred (also noted in the ADR 0010/0011 lineage).

**Inline completion (autocomplete `both`/`inline`):**

4. **Casing + non-prefix matches.** We preserve the user's typed casing (`ap` → `apple`) and only inline
   on a prefix match; Base UI shows the highlighted label verbatim (`Apple`) and inlines any keyboard-
   highlighted item. A fuzzy non-prefix match shows no inline preview here. Minor UX divergence.
5. **`setSuppressInline` keyed only off Backspace/Delete keydown.** A non-keydown edit (paste, cut, IME
   commit, Android soft keyboard) runs with the previous key's suppress flag, so inline can appear or be
   suppressed at the wrong time. Reset it at input time, not only on keydown.

**Cleanup / performance (not correctness):**

6. **Done (2026-07-12): large-list registration.** The shared engine now keeps a stable
   element→item `Map` plus a numeric reactive tick, so each registration/unregistration is O(1) and
   `orderedItems` materializes/sorts once for the Angular render batch. Group membership uses the same
   pattern with a stable `Set`, removing the second growing-array copy for grouped lists. A real-Chromium
   benchmark covers 50 / 500 / 2000 mounted items; a representative same-machine 2000-item comparison
   moved from 49.5 ms to 45.3 ms with the render count unchanged (within the suite's configured ±20%
   noise threshold; the guaranteed win is eliminating the quadratic allocation path).
7. **Duplication:** `domOrder` is another copy of `sortByDocumentPosition` (also in composite,
   menubar); plus dead pass-through methods and byte-identical `openForBrowse`/`labelFor`/
   `coerceAutoHighlight` across the two roots. Extract a shared comparator + move shared root plumbing
   into the engine.
8. **The inline-preview effect runs on every keystroke/navigation even when `inlineMode` is permanently
   `false`** (combobox). Gate the effect's work on `inlineMode()` to avoid re-subscribing + resolving on
   the hottest paths.

Suggested next batch: **#4–#5** (visible inline-completion divergence); the remaining cleanup items are
lower-value polish.
