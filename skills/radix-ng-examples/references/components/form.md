# Form

The top of the forms layer cake: aggregates fields, maps server errors by name, and intercepts submit and reset.

> Index — full source of each example is one click away in `../examples/form--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Maps `errors` (server/external) onto fields by `name`; messages flow to `rdxFieldError`.
- ✅ Clears a field's external error as soon as the user edits it; `onClearErrors` emits the remaining map.
- ✅ Intercepts submit (`preventDefault`), emitting `onFormSubmit` with values serialized from `FormData`.
- ✅ Blocks submit when any field is invalid and focuses the first invalid field, in DOM order.
- ✅ Handles native `reset`: clears errors and re-syncs each field's touched/dirty/focused/filled state.
- ✅ Aggregate state via `data-invalid`, `data-dirty`, `data-touched`, and `data-submitting`.
- ✅ Form-system-agnostic: works with plain native controls, Reactive Forms (`(ngSubmit)` still fires), and template-driven forms.
- ✅ `rdxNgControlField` connects Reactive / template-driven controls to registered Fields without manual validity bindings.
- ✅ Signal Forms integration: an `RdxFormState` provider seam lets `[rdxSignalForm]` own the form's aggregate validity / dirty / touched / submitting and route per-field **client** errors by `name` (gated by `validationMode`). The `errors` input stays a separate eager **server** channel.

## Import

```typescript
import { RdxFormRoot } from '@radix-ng/primitives/form';
```

## Anatomy

Compose Form over Fieldset → Field → Control. Each field's `name` is the key the Form's `errors` map
matches against; the native control's `name` is what `FormData` serializes.

```html
<form rdxFormRoot [errors]="serverErrors">
    <fieldset rdxFieldsetRoot>
        <legend rdxFieldsetLegend>Account</legend>
        <div rdxFieldRoot name="email">
            <label rdxFieldLabel>Email</label>
            <input rdxFieldControl name="email" type="email" />
            <p rdxFieldError #err="rdxFieldError">{{ err.messages().join(' ') }}</p>
        </div>
    </fieldset>
    <button type="submit">Submit</button>
</form>
```

## Examples

- [Server errors with clear-on-edit](../examples/form--server-errors-with-clear-on-edit.md)
- [Reset](../examples/form--reset.md)
- [Reactive Forms](../examples/form--reactive-forms.md)
- [Native controls](../examples/form--native-controls.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/form.json`
- Styling (parts + `data-*`): `references/styling-contract/form.json`
