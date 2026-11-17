# Checkbox — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [checkbox](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/checkbox).
Pinned exported parts/functions: `Root`, `Indicator`.
The Angular entry also covers [checkbox-group](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/checkbox-group); audit both part sets.

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

| Angular declaration                                          | Selector / role             | Direct input/model/output declarations                                                                                                                                                                                                                          |
| ------------------------------------------------------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxCheckboxButtonDirective`](src/checkbox-button.ts)       | `button[rdxCheckboxButton]` | No direct signal input/model/output declaration.                                                                                                                                                                                                                |
| [`RdxCheckboxGroupDirective`](src/checkbox-group.ts)         | `[rdxCheckboxGroup]`        | `value` (model), `defaultValue`, `allValues`, `name`, `form`, `disabled`, `onValueChange` (output)                                                                                                                                                              |
| [`RdxCheckboxIndicatorDirective`](src/checkbox-indicator.ts) | `[rdxCheckboxIndicator]`    | `keepMounted`                                                                                                                                                                                                                                                   |
| [`RdxCheckboxInputDirective`](src/checkbox-input.ts)         | `input[rdxCheckboxInput]`   | No direct signal input/model/output declaration.                                                                                                                                                                                                                |
| [`RdxCheckboxRootDirective`](src/checkbox-root.ts)           | `[rdxCheckboxRoot]`         | `checked` (model), `defaultChecked`, `indeterminate` (model), `value`, `uncheckedValue`, `disabled`, `readOnly`, `required`, `invalid`, `pending`, `touched` (model), `dirty`, `errors`, `name`, `parent`, `form`, `onCheckedChange` (output), `touch` (output) |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **Editable form value and auxiliary state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                                                            | Current declaration                     | Ownership review                                                                                               |
| ------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`RdxCheckboxGroupDirective.value`](src/checkbox-group.ts)                      | `model<string[]>([])`                   | Editable form model where the actual Angular control contract requires it; coordinate CVA/native/Signal Forms. |
| [`RdxCheckboxRootDirective.checked`](src/checkbox-root.ts)                      | `model<boolean>(false)`                 | Editable form model where the actual Angular control contract requires it; coordinate CVA/native/Signal Forms. |
| [`RdxCheckboxRootDirective.indeterminate`](src/checkbox-root.ts)                | `model<boolean>(false)`                 | Define navigation/draft/presentation ownership separately from the form or business value.                     |
| [`RdxCheckboxRootDirective.submitValue`](src/checkbox-root.ts) (public `value`) | `input<string \| undefined>(undefined)` | Readonly supplied data/identity/configuration; no local model write.                                           |
| [`RdxCheckboxRootDirective.touched`](src/checkbox-root.ts)                      | `model<boolean>(false)`                 | Form interaction metadata; verify the installed touch/input/output adapter contract.                           |

| Declared default / source                                         | Declaration                                                         | Required comparison                                                                                                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxCheckboxGroupDirective.defaultValue`](src/checkbox-group.ts) | `input<string[]>(undefined)`                                        | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |
| [`RdxCheckboxRootDirective.defaultChecked`](src/checkbox-root.ts) | `input<boolean \| undefined, BooleanInput \| undefined>(undefined)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                        | Current observation / required target comparison                                                                                                                                                                             | Priority |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Checked and group ownership | Source: Root owns checked/indeterminate models and Group owns an array value model. Keep the required checkbox form model; define group-derived state and select-all ownership separately.                                   | P1       |
| Defaults/form priority      | Source: first-defined default latches write checked/group values. A latch alone does not establish bound false/empty-array/CVA precedence or prevent first late defaults.                                                    | P1       |
| Two upstream entries        | The Angular entry combines Checkbox and CheckboxGroup plus native submission adapters. Compare mixed/select-all state, disabled/readonly, keyboard/native form events, reset and label behavior against both pinned entries. | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **2 files discovered**; not a passing-test count.
- No same-family named browser behavior file was found. Cross-family consumer or shared-mechanism checks may exist; locate them before claiming absence or coverage.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- [SSR consumer page](../../../apps/radix-ssr-testing/src/app/components/checkbox/page.ts) exists. Its presence does not prove initial-state, lifecycle or hydration equivalence; inspect actual assertions.

No runtime suite was executed for this initial matrix sweep. Complete focused state/DI units,
native/layout browser cases and SSR/hydration checks before promoting rows; add a paired pinned
fixture before certifying equivalent observable behavior. See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
