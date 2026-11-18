# Number Field — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [number-field](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/number-field).
Pinned exported parts/functions: `Root`, `Group`, `Increment`, `Decrement`, `Input`, `ScrubArea`, `ScrubAreaCursor`.

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

| Angular declaration                                                      | Selector / role                                    | Direct input/model/output declarations                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`RdxNumberFieldButton`](src/number-field-button.ts)                     | Base/composition directive; inspect its consumers. | `disabled`                                                                                                                                                                                                                                                               |
| [`RdxNumberFieldDecrement`](src/number-field-decrement.ts)               | `button[rdxNumberFieldDecrement]`                  | No direct signal input/model/output declaration.                                                                                                                                                                                                                         |
| [`RdxNumberFieldGroup`](src/number-field-group.ts)                       | `div[rdxNumberFieldGroup]`                         | No direct signal input/model/output declaration.                                                                                                                                                                                                                         |
| [`RdxNumberFieldHiddenInput`](src/number-field-hidden-input.ts)          | `input[rdxNumberFieldHiddenInput]`                 | No direct signal input/model/output declaration.                                                                                                                                                                                                                         |
| [`RdxNumberFieldIncrement`](src/number-field-increment.ts)               | `button[rdxNumberFieldIncrement]`                  | No direct signal input/model/output declaration.                                                                                                                                                                                                                         |
| [`RdxNumberFieldInput`](src/number-field-input.ts)                       | `input[rdxNumberFieldInput]`                       | No direct signal input/model/output declaration.                                                                                                                                                                                                                         |
| [`RdxNumberFieldRoot`](src/number-field-root.ts)                         | `div[rdxNumberFieldRoot]`                          | `id`, `min`, `max`, `step`, `smallStep`, `largeStep`, `snapOnStep`, `allowOutOfRange`, `allowWheelScrub`, `format`, `locale`, `disabled`, `readonly`, `required`, `name`, `form`, `defaultValue`, `value` (model), `onValueChange` (output), `onValueCommitted` (output) |
| [`RdxNumberFieldScrubArea`](src/number-field-scrub-area.ts)              | `[rdxNumberFieldScrubArea]`                        | `direction`, `pixelSensitivity`, `teleportDistance`                                                                                                                                                                                                                      |
| [`RdxNumberFieldScrubAreaCursor`](src/number-field-scrub-area-cursor.ts) | `[rdxNumberFieldScrubAreaCursor]`                  | No direct signal input/model/output declaration.                                                                                                                                                                                                                         |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **Editable form value and auxiliary state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                                   | Current declaration           | Ownership review                                                                                               |
| ------------------------------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`RdxNumberFieldRoot.value`](src/number-field-root.ts) | `model<number \| null>(null)` | Editable form model where the actual Angular control contract requires it; coordinate CVA/native/Signal Forms. |

| Declared default / source                                     | Declaration                | Required comparison                                                                                                                                         |
| ------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxNumberFieldRoot.defaultValue`](src/number-field-root.ts) | `input<number>(undefined)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                    | Current observation / required target comparison                                                                                                                       | Priority |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Value versus text draft | Source: numeric/null value is a form model; typed text, formatting and scrub state need distinct ownership. Coordinate the CVA and model paths once per accepted edit. | P1       |
| Default reassignment    | TestBed reproduced a bound FormControl being overwritten by the default. See [form precedence cases](#form-precedence-cases).                                          | P1       |
| Numeric interaction     | Compare locale parsing, min/max/step/clamping, committed-event timing, spin buttons, keyboard/wheel/scrub gestures, native submit and validation.                      | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Form precedence cases

On 2026-11-18 a TestBed fixture bound `FormControl(0, { nonNullable: true })` and
`[defaultValue]="11"` to [Root](src/number-field-root.ts). `currentValue()` reads the CVA
state that renders the number string. The `value()` model is a separate observable surface.

| Operation                     | FormControl / Root `value()` / displayed text | Target Angular behavior                                                                                                                                                                                           |
| ----------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial binding               | `11` / `11` / `"11"`                          | The form's initial `0` wins and initialization leaves the control value untouched. Repeat with `null` on a nullable control.                                                                                      |
| `control.setValue(6)`         | `6` / `11` / `"6"`                            | The form, rendered value and documented effective-value readout report `6` without a user-change request.                                                                                                         |
| Change `defaultValue` to `12` | `12` / `12` / `"12"`                          | The late default leaves the form and display at `6`. Separately verify a standalone initial default of `11` and a once-only native reset baseline.                                                                |
| `control.reset(3)`            | `3` / `12` / `"3"`                            | The reset-supplied `3` is effective. Check CVA, Signal Forms reset and native form reset according to their separate [ownership rules](../../../docs/engineering/state-ownership.md#initialization-and-defaults). |

The existing [uncontrolled-default unit](__tests__/number-field.spec.ts) supplies the default after
the fixture's first change detection. Split it into a host with the default on first render and a
late assignment case when changing the contract. Add a form conflict case with bound `0` before
changing the CVA or public model. The pin's [NumberField Root](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/number-field/root/NumberFieldRoot.tsx)
is the reference for standalone `value`/`defaultValue`. Angular form adapters have their own reset rules.

## Evidence inventory and next checks

- [Local unit files](__tests__): **1 file discovered**; not a passing-test count.
- Named browser regression files: [number-field.behavior.spec.ts](../../../apps/visual-regression/tests/number-field.behavior.spec.ts). Scenario scope and freshness still need review; none was run by this inventory.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

The [TestBed audit](../../../docs/engineering/parity-matrices.md#confirmed-state-gaps) checked CVA, exposed model and rendered numeric text. Paired browser comparisons remain pending.
See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
