# Toolbar — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [toolbar](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/toolbar).
Pinned exported parts/functions: `Separator`, `Root`, `Group`, `Button`, `Link`, `Input`.

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

| Angular declaration                               | Selector / role          | Direct input/model/output declarations                      |
| ------------------------------------------------- | ------------------------ | ----------------------------------------------------------- |
| [`RdxToolbarButton`](src/toolbar-button.ts)       | `[rdxToolbarButton]`     | `disabled`, `focusableWhenDisabled`, `nativeButton`, `role` |
| [`RdxToolbarGroup`](src/toolbar-group.ts)         | `[rdxToolbarGroup]`      | `disabled`                                                  |
| [`RdxToolbarInput`](src/toolbar-input.ts)         | `input[rdxToolbarInput]` | `defaultValue`, `disabled`, `focusableWhenDisabled`         |
| [`RdxToolbarLink`](src/toolbar-link.ts)           | `[rdxToolbarLink]`       | No direct signal input/model/output declaration.            |
| [`RdxToolbarRoot`](src/toolbar-root.ts)           | `[rdxToolbarRoot]`       | `orientation`, `dir`, `loopFocus`, `disabled`               |
| [`RdxToolbarSeparator`](src/toolbar-separator.ts) | `[rdxToolbarSeparator]`  | `orientation`                                               |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **Several ownership contracts**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

No direct open/value/checked/pressed model was found in the exported decorated classes.
This is **not** a claim of statelessness: composition, services, native DOM or internal signals can
own state. The family-specific matrix below identifies the relevant boundary.

| Declared default / source                              | Declaration                | Required comparison                                                                                                                                         |
| ------------------------------------------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxToolbarInput.defaultValue`](src/toolbar-input.ts) | `input<string>(undefined)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                      | Current observation / required target comparison                                                                                                                                                        | Priority |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Owner boundaries          | Root/Group coordinate composite focus and disabled metadata; Input owns native text and grouped Toggle owns its form value. Do not unify these under one Toolbar value model.                           | P1       |
| Input defaults            | Source: ToolbarInput seeds a native value from the first supplied defaultValue. Compare a late default after user typing and initial native/form values; specify reset behavior.                        | P1       |
| Native/composite behavior | Compare Button/Link/Input/Separator, caret-edge arrow handoff, authored roles/tabindex, disabled/focusable items and Toggle composition. Existing Button comparisons certify only their Toolbar subset. | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **4 files discovered**; not a passing-test count.
- No same-family named browser behavior file was found. Cross-family consumer or shared-mechanism checks may exist; locate them before claiming absence or coverage.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

No runtime suite was executed for this initial matrix sweep. Complete focused state/DI units,
native/layout browser cases and SSR/hydration checks before promoting rows; add a paired pinned
fixture before certifying equivalent observable behavior. See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
