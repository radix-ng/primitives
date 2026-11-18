# Composite — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

No same-name public entry exists in this pin. The related [internals/composite](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/internals/composite) is an internal/reference mechanism or another public family, not a drop-in public API.

**Scope: initial source inventory and comparison backlog.** Exported local declarations and evidence
locations were inventoried; complete per-handler, per-attribute and browser equivalence has not been
established. A source observation below is not a newly passing runtime or differential result.

**Breaking changes are permitted; backward compatibility does not constrain the target.** Apply the
[state ownership/defaults contract](../../../docs/engineering/state-ownership.md) per field. Inputs,
models, outputs, defaults and part boundaries may change; do not retain compatibility mirrors or
aliases solely for the old API. Review earlier ADR decisions explicitly when replacing them.

## Public surface inventory

Source of truth: [entry barrel](index.ts). These are directly exported decorated classes, not a
claim that inherited/host-directive APIs or every upstream prop have already been compared. Exported
composition bases, guards and internal helpers are not thereby promoted to stable public widget parts.

| Angular declaration                                  | Selector / role          | Direct input/model/output declarations                                                                                                                                                                                                |
| ---------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxCompositeItem`](src/composite-item.ts)          | `[rdxCompositeItem]`     | `tabIndex`                                                                                                                                                                                                                            |
| [`RdxCompositeList`](src/composite-list.ts)          | `[rdxCompositeList]`     | `onMapChange` (output)                                                                                                                                                                                                                |
| [`RdxCompositeListItem`](src/composite-list-item.ts) | `[rdxCompositeListItem]` | `metadata`                                                                                                                                                                                                                            |
| [`RdxCompositeRoot`](src/composite-root.ts)          | `[rdxCompositeRoot]`     | `orientation`, `dir`, `loopFocus`, `enableHomeAndEndKeys`, `disabledIndices`, `modifierKeys`, `highlightItemOnHover`, `stopEventPropagation`, `highlightedIndex` (model), `onHighlightedIndexChange` (output), `onMapChange` (output) |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **UI request/controlled state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                                         | Current declaration | Ownership review                                                                           |
| ------------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------ |
| [`RdxCompositeRoot.highlightedIndex`](src/composite-root.ts) | `model<number>(0)`  | Define navigation/draft/presentation ownership separately from the form or business value. |

No explicit default-prefixed signal input/model was found in these local declarations. Inherited
defaults still require inspection. Readonly input/configuration defaults are not uncontrolled state
seeds; do not add dummy defaultValue/valueChange APIs to satisfy a template.

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                       | Current observation / required target comparison                                                                                                                                                         | Priority |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Registry versus navigation | Source: List registration/order delegates to core useElementRegistry; Root owns a writable highlightedIndex and roving policy. Do not merge collection ownership with focus policy.                      | P1       |
| Highlight requests         | Define supplied highlightedIndex ownership, native-focus requests, disabled-index policy and uncontrolled fallback. The absence of defaultValue does not settle this model contract.                     | P1       |
| Composition                | Compare retained native focus through tracked reorder, metadata-only updates, removal, nested/projected owners, grids and RTL with the pinned internal composite rather than a nonexistent public entry. | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Composite units](__tests__/composite.spec.ts) exercise retained instances through DOM and
  tracked `@for` moves and verify ordered metadata. [Core registry units](../core/__tests__/use-element-registry.spec.ts)
  cover replacement ownership, metadata changes, wrapper moves, reconnection and disposal.
  The registry is shared with Combobox/Autocomplete. Roving tabindex and
  `aria-activedescendant` remain distinct. [ADR 0086](../../../docs/adr/0086-shared-element-registry.md).
- Named browser regression files: [composite.behavior.spec.ts](../../../apps/visual-regression/tests/composite.behavior.spec.ts). Scenario scope and freshness still need review; none was run by this inventory.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

No runtime suite was executed for this initial matrix sweep. Complete focused state/DI units,
native/layout browser cases and SSR/hydration checks before promoting rows; add a paired pinned
fixture before certifying equivalent observable behavior. See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
