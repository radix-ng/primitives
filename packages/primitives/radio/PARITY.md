# Radio — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [radio](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio).
Pinned exported parts/functions: `Root`, `Indicator`.
The Angular entry also covers [radio-group](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio-group); audit both part sets.

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

| Angular declaration                                               | Selector / role            | Direct input/model/output declarations                                                                        |
| ----------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [`RdxRadioGroupDirective`](src/radio-root.directive.ts)           | `[rdxRadioRoot]`           | `value` (model), `defaultValue`, `name`, `form`, `disabled`, `readOnly`, `required`, `onValueChange` (output) |
| [`RdxRadioIndicatorDirective`](src/radio-indicator.directive.ts)  | `[rdxRadioIndicator]`      | `keepMounted`                                                                                                 |
| [`RdxRadioItemInputDirective`](src/radio-item-input.directive.ts) | `input[rdxRadioItemInput]` | No direct signal input/model/output declaration.                                                              |
| [`RdxRadioItemDirective`](src/radio-item.directive.ts)            | `[rdxRadioItem]`           | `value`, `id`, `required`, `disabled`, `readOnly`                                                             |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **Editable form value and auxiliary state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                                          | Current declaration           | Ownership review                                                                                               |
| ------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`RdxRadioGroupDirective.value`](src/radio-root.directive.ts) | `model<string \| null>(null)` | Editable form model where the actual Angular control contract requires it; coordinate CVA/native/Signal Forms. |
| [`RdxRadioItemDirective.value`](src/radio-item.directive.ts)  | `input.required<string>()`    | Readonly supplied data/identity/configuration; no local model write.                                           |

| Declared default / source                                            | Declaration                | Required comparison                                                                                                                                         |
| -------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxRadioGroupDirective.defaultValue`](src/radio-root.directive.ts) | `input<string>(undefined)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                  | Current observation / required target comparison                                                                                                                                        | Priority |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Selection owner       | Source: Group value is a model; Item value is a readonly identity. Keep form edit semantics and one group-owned selection; do not create per-item selected models.                      | P1       |
| Default priority      | Source: defaultValue uses a first-defined latch with a null-value guard. Compare explicit null, initial CVA/model values, late defaults and native form reset.                          | P1       |
| Combined part mapping | Angular Radio includes Group, Item, Indicator and native input; compare both pinned Radio and RadioGroup, including keyboard/RTL, required/disabled/readonly, labels and serialization. | P2       |

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
