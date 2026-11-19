# Number Field — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [number-field](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/number-field).
Pinned exported parts/functions: `Root`, `Group`, `Increment`, `Decrement`, `Input`, `ScrubArea`, `ScrubAreaCursor`.

**Scope.** The initial inventory is followed by paired browser coverage for value initialization and
late defaults. Angular form ownership and reset have focused tests.

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

| Area                         | Current observation / required target comparison                                                                                                                              | Priority        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Value ownership and defaults | The model and CVA share one value. The supplied value takes precedence and an uncontrolled default seeds the field once. See [form precedence cases](#form-precedence-cases). | Verified subset |
| Draft versus committed value | Compare partial input, external writes while editing, formatting and scrub commits.                                                                                           | P1              |
| Numeric interaction          | Compare locale parsing, min/max/step/clamping, committed-event timing, spin buttons, keyboard/wheel/scrub gestures, native submit and validation.                             | P2              |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Form precedence cases

The 2026-11-18 audit found that `defaultValue` overwrote a bound `FormControl(0)` and that external
CVA writes could leave `value()` stale. The [Root](src/number-field-root.ts) now uses its
`model<number | null>` for both form adapters, the visible input and native submission. The
[one-time default contract](../../../docs/adr/0071-menu-initial-model-defaults.md) covers explicit
empty and falsy values. Local edits remain writable through Angular's form model.

| Operation                                              | Verified Angular behavior                                                                                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Initial form or model value with a conflicting default | Explicit `0` renders as `0`. Explicit `null` renders empty. Tests cover model binding, Reactive Forms and Signal Forms.                                            |
| `control.setValue(6)` and `control.reset(3)`           | Form, public model and input agree. External writes emit no user change or commit.                                                                                 |
| Late `defaultValue`                                    | The visible value, model and submitted value follow the last accepted state.                                                                                       |
| Native form reset                                      | A standalone field restores the resolved initial value. A connected Reactive Forms control restores its Angular baseline, including `null` for a nullable control. |

The [paired suite](../../../apps/parity-testing/primitives/number-field/README.md) compares six
initial/default scenarios with the [pinned Number Field Root](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/number-field/root/NumberFieldRoot.tsx).
It checks visible text, native serialization through the authored number input, external writes and
keyboard changes with commit counts. [Angular units](__tests__/number-field.spec.ts) cover form
adapters, interaction state and native reset.

## Evidence inventory and next checks

- [Local units](__tests__/number-field.spec.ts) cover `value`, form writes, reset, disabled state and numeric interactions.
- [Paired browser comparisons](../../../apps/parity-testing/primitives/number-field/README.md) cover defaults, serialization and keyboard edit acceptance.
- [Storybook browser regressions](../../../apps/visual-regression/tests/number-field.behavior.spec.ts) cover increment/decrement and press-and-hold.
- [SSR rendering](../../../apps/radix-ssr-testing/src/ssr-rendering.spec.ts) checks form and model precedence in serialized inputs.

Locale parsing, clamping, gesture handling and commit timing outside keyboard steps remain open.
See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
