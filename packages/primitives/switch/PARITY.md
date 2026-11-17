# Switch — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [switch](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/switch).
Pinned exported parts/functions: `Root`, `Thumb`.

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

| Angular declaration                     | Selector / role         | Direct input/model/output declarations                                                                                                                                                |
| --------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxSwitchInput`](src/switch-input.ts) | `input[rdxSwitchInput]` | No direct signal input/model/output declaration.                                                                                                                                      |
| [`RdxSwitchRoot`](src/switch-root.ts)   | `button[rdxSwitchRoot]` | `id`, `defaultChecked`, `checked` (model), `disabled`, `readonly`, `required`, `name`, `form`, `value`, `uncheckedValue`, `aria-labelledby`, `aria-label`, `onCheckedChange` (output) |
| [`RdxSwitchThumb`](src/switch-thumb.ts) | `span[rdxSwitchThumb]`  | No direct signal input/model/output declaration.                                                                                                                                      |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **Editable form value and auxiliary state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                                               | Current declaration     | Ownership review                                                                                               |
| ------------------------------------------------------------------ | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`RdxSwitchRoot.checked`](src/switch-root.ts)                      | `model<boolean>(false)` | Editable form model where the actual Angular control contract requires it; coordinate CVA/native/Signal Forms. |
| [`RdxSwitchRoot.submitValue`](src/switch-root.ts) (public `value`) | `input<string>('on')`   | Readonly supplied data/identity/configuration; no local model write.                                           |

| Declared default / source                            | Declaration                                                         | Required comparison                                                                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxSwitchRoot.defaultChecked`](src/switch-root.ts) | `input<boolean \| undefined, BooleanInput \| undefined>(undefined)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                            | Current observation / required target comparison                                                                                                            | Priority |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Checked versus submission token | Source: checked is a required form model; public value aliases a differently named TS submission field. Preserve the checkbox Signal Forms member contract. | P1       |
| Default/form priority           | Source: first-defined defaultChecked writes checked/CVA. Compare bound false, initial form writes, late defaults, uncheckedValue and reset baselines.       | P1       |
| Native activation               | Compare switch role, native input events, Space/Enter, label, readonly/disabled, hidden-input serialization and external/native forms.                      | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **1 file discovered**; not a passing-test count.
- No same-family named browser behavior file was found. Cross-family consumer or shared-mechanism checks may exist; locate them before claiming absence or coverage.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- [SSR consumer page](../../../apps/radix-ssr-testing/src/app/components/switch/page.ts) exists. Its presence does not prove initial-state, lifecycle or hydration equivalence; inspect actual assertions.

No runtime suite was executed for this initial matrix sweep. Complete focused state/DI units,
native/layout browser cases and SSR/hydration checks before promoting rows; add a paired pinned
fixture before certifying equivalent observable behavior. See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
