---
name: signal-forms-readiness
description: Conformance matrix and backlog for adopting Angular Signal Forms (@angular/forms/signals) across Radix NG form controls
metadata:
  type: project
---

# Signal Forms readiness

Tracks how close each Radix NG form control is to Angular **Signal Forms**
(`@angular/forms/signals`, stable in Angular 22) and what prep can land on
Angular 21 today.

## Background

Signal Forms is a **parallel mechanism to `ControlValueAccessor`**, not a
replacement that we plug into. The `[field]` directive discovers the control on
its host, detects which interface it structurally implements, and binds form
state through signals:

- `FormValueControl<T>` — control exposes `value = model<T>()`. For text inputs,
  selects, radios, sliders, date/number fields — anything editing a single value.
- `FormCheckboxControl` — control exposes `checked = model<boolean>()`. A control
  implementing this **must NOT** also expose a `value` member.

Both extend `FormUiControl`, which adds optional state as plain signals:

| Kind      | Names                                                                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input()` | `disabled`, `readonly`, `required`, `invalid`, `hidden`, `pending`, `errors` (`ValidationError[]`), `disabledReasons`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `name` |
| `model()` | `value` / `checked` (required), `touched`, `dirty`                                                                                                                               |

CVA stays for Reactive/Template forms; a control can implement **both** CVA and
`FormValueControl`/`FormCheckboxControl` at once, enabling additive migration.

Prerequisite for shipping real integration: **Angular 22** (the API is
experimental in 21). Everything in [Prep work](#prep-work-doable-on-angular-21)
is version-independent.

## Conformance matrix

| Control (file)                                                            | Target interface                     | Required signal               | Optional already present                         | Missing                                                                                     | Collisions / risk                                                                                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------ | ----------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **checkbox-root** (`checkbox/src/checkbox-root.ts`)                       | `FormCheckboxControl`                | `checked = model` ✅          | `disabled`, `readonly`, `required`, `name`       | `invalid`, `errors`, `touched`, `dirty`                                                     | 🔴 has `value = input('on')` — interface **forbids** `value`; `checked` is `CheckedState` (`boolean \| 'indeterminate'`), interface wants `boolean` |
| **checkbox-group** (`checkbox/src/checkbox-group.ts`)                     | `FormValueControl<string[]>`         | `value = model` ✅            | `disabled`                                       | `required`, `readonly`, `invalid`, `errors`, `touched`, `dirty`, `name`                     | —                                                                                                                                                   |
| **switch-root** (`switch/src/switch-root.ts`)                             | `FormCheckboxControl`                | `checked = model<boolean>` ✅ | `disabled`, `required`, `readonly`, `name`       | `invalid`, `errors`, `touched`, `dirty`                                                     | 🟢 clean — Base UI rewrite added `readonly`/`name` and dropped CDK `_IdGenerator`                                                                   |
| **radio-root** (`radio/src/radio-root.directive.ts`)                      | `FormValueControl<string \| null>`   | `value = model` ✅            | `disabled`, `readonly`, `required`, `name`       | `invalid`, `errors`, `touched`, `dirty`                                                     | 🟢 most ready                                                                                                                                       |
| **select-root** (`select/src/select-root.ts`)                             | `FormValueControl<AcceptableValue…>` | `value = model` ✅            | `disabled`                                       | `required`, `readonly`, `invalid`, `errors`, `touched`, `dirty`, `name`                     | —                                                                                                                                                   |
| **toggle-group** (`toggle-group/src/toggle-group-base.ts`)                | `FormValueControl<string[]>`         | `value = model<string[]>` ✅  | `disabled`                                       | `required`, `readonly`, `invalid`, `errors`, `touched`, `dirty`, `name`                     | —                                                                                                                                                   |
| **slider-root** (`slider/src/slider-root.component.ts`)                   | `FormValueControl<number[]>`         | ❌ named `modelValue`         | `disabled`, `min`, `max`                         | add/rename `value`; `required`, `readonly`, `invalid`, `errors`, `touched`, `dirty`, `name` | 🔴 value signal is `modelValue`, not `value`                                                                                                        |
| **number-field-root** (`number-field/src/number-field-root.directive.ts`) | `FormValueControl<number>`           | `value = model<number>` ✅    | `disabled`, `readonly`, `required`, `min`, `max` | `invalid`, `errors`, `touched`, `dirty`, `name`                                             | 🟢 `min/max` already align                                                                                                                          |
| **input** (`input/src/input.directive.ts`)                                | `FormValueControl<RdxInputValue>`    | `value = model` ✅            | `disabled`, `required`, **`invalid`** ✅         | `readonly`, `errors`, `touched`, `dirty`, `minLength/maxLength/pattern`, `name`             | 🟢 only control that already has `invalid`                                                                                                          |
| **date-field-root** (`date-field/src/date-field-root.directive.ts`)       | `FormValueControl<DateValue>`        | `value = model` ✅            | `disabled`, `readonly`                           | `required`, `invalid`, `errors`, `touched`, `dirty`, `name`, `min/max`                      | —                                                                                                                                                   |
| **time-field-root** (`time-field/src/time-field-root.directive.ts`)       | `FormValueControl<TimeValue>`        | `value = model` ✅            | `disabled`, `readonly`                           | `required`, `invalid`, `errors`, `touched`, `dirty`, `name`, `min/max`                      | —                                                                                                                                                   |
| **editable-root** (`editable/src/editable-root.ts`)                       | `FormValueControl<string>`           | `value = model<string>` ✅    | `disabled`, `readonly`, `required`, `maxLength`  | `invalid`, `errors`, `touched`, `dirty`, `name`, `minLength`, `pattern`                     | —                                                                                                                                                   |

## Collisions to resolve by design (Angular 21)

1. 🔴 **checkbox — two problems.**
   - A `value` member is forbidden by `FormCheckboxControl`. The current
     `value = input('on')` is the native HTML submit value — needs to be split
     from the interface surface (e.g. rename the internal member, keep `value`
     only as a host attribute binding).
   - `checked: CheckedState` (`boolean | 'indeterminate'`) is incompatible with
     `checked: model<boolean>()`. Indeterminate is a third state to reconcile.
   - Hardest case — prototype first.
2. 🔴 **slider — `modelValue` instead of `value`.** Either rename (breaking for
   templates and `valueChange`) or add a parallel `value` model. Needs a decision.
3. 🟡 **Most controls lack `invalid`/`errors`/`touched`/`dirty`.** Homogeneous
   batch — close it with one shared pattern (see prep #3).

## Readiness ranking

- 🟢 **radio, switch, input, number-field** — clean, minimal edits → best first-pilot candidates.
- 🟡 **select, toggle-group, checkbox-group, date/time-field, editable** — need `invalid/errors/touched/dirty` + `required/name`.
- 🔴 **checkbox, slider** — require name/type collision resolution.

## Open question (not answered by the matrix)

All these controls are **directives**; Signal Forms examples are **components**.
Whether `[field]` binds to a directive-based control via DI is the key technical
risk — resolved only by a spike (prep #5).

## Prep work doable on Angular 21

Ordered by value/risk:

1. **Inventory + matrix** — this document. Keep it the living backlog.
2. **Resolve checkbox collision** (#1 above) — design now, apply later.
3. **Local shim interfaces in `core`** — declare `RdxFormValueControl<T>` /
   `RdxFormCheckboxControl` mirroring Angular's contract **without importing**
   `@angular/forms/signals`; mark controls with `implements`. Locks the public
   shape and catches naming regressions on CI. Mirror the existing
   `RdxControlValueAccessor` helper location. For `errors`, use a local
   `ValidationError`-like type until v22.
4. **Decouple `Field` from the native `.value` heuristic** — today
   `rdxFieldControl` computes `filled/dirty/touched` from `element.value`
   (`field-control.ts:77-82`) and `rdxFieldRoot` computes `invalidState/
requiredState`. Make the context able to **consume** external field state so
   Field can later read Signal Forms state instead of self-computing. Version-independent.
5. **Learning spike (not for merge)** — Signal Forms exists as experimental in 21. Build a throwaway sandbox to confirm `[field]` discovery against a
   directive-based control. Experimental API may differ from stable 22.
6. **Remove CDK from the form path** — `BooleanInput` from `@angular/cdk/coercion`
   (`control-value-accessor.ts:1`, `field-control`, etc.). `switch-root` already
   moved off CDK `_IdGenerator` to the `core` generator during its Base UI rewrite.
   Pure prep, aligns with the documented CDK phase-out, shrinks the upgrade surface.

Suggested first pass: **1 → 3 → 4** (max prep, zero version risk), with **2** and
**6** as isolated side PRs.

## Related

- Angular docs: [Custom controls](https://angular.dev/guide/forms/signals/custom-controls),
  [`FormValueControl`](https://angular.dev/api/forms/signals/FormValueControl),
  [`FormField`](https://angular.dev/api/forms/signals/FormField)
- See `architecture.md` for the CDK phase-out plan referenced in prep #6.
