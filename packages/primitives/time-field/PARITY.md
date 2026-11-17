# Time Field — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

No direct public counterpart exists in this pin. Record the Angular-specific contract and applicable shared behavior; direct Base UI part parity is **not applicable**, rather than an automatically missing upstream feature.

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

| Angular declaration                                               | Selector / role       | Direct input/model/output declarations                                                                                                                      |
| ----------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxTimeFieldInputDirective`](src/time-field-input.directive.ts) | `[rdxTimeFieldInput]` | `part`                                                                                                                                                      |
| [`RdxTimeFieldRootDirective`](src/time-field-root.directive.ts)   | `[rdxTimeFieldRoot]`  | `value` (model), `hourCycle`, `granularity`, `locale`, `dir`, `minValue`, `maxValue`, `hideTimeZone`, `disabled`, `readonly`, `step`, `placeholder` (model) |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **Editable form value and auxiliary state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                                                        | Current declaration                                        | Ownership review                                                                                               |
| --------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`RdxTimeFieldRootDirective.value`](src/time-field-root.directive.ts)       | `model<TimeValue \| null>(null)`                           | Editable form model where the actual Angular control contract requires it; coordinate CVA/native/Signal Forms. |
| [`RdxTimeFieldRootDirective.placeholder`](src/time-field-root.directive.ts) | `model<TimeValue \| undefined>(this.defaultDate().copy())` | Define navigation/draft/presentation ownership separately from the form or business value.                     |

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

| Area                       | Current observation / required target comparison                                                                                                                                      | Priority |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Value versus segment draft | Source: value and placeholder are models, with linked converted/segment state. Preserve the editable form value while defining partial/time-zone/placeholder ownership independently. | P1       |
| Initial bindings           | Source: placeholder is seeded from defaultDate().copy() before input bindings settle. Compare initial locale/hourCycle/granularity and supplied placeholder/value.                    | P1       |
| Time contract              | No public Time Field entry exists in the pin. Verify partial/invalid time, locale/RTL, min/max, time zone, keyboard/paste, external updates, form reset and SSR IDs.                  | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **1 file discovered**; not a passing-test count.
- No same-family named browser behavior file was found. Cross-family consumer or shared-mechanism checks may exist; locate them before claiming absence or coverage.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

No runtime suite was executed for this initial matrix sweep. Complete focused state/DI units,
native/layout browser cases and SSR/hydration checks before promoting rows; add a paired pinned
fixture before certifying equivalent observable behavior. See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
