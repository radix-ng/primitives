# Signal Forms

Bridge Angular [Signal Forms](https://angular.dev/guide/forms/signals) into headless `Field` and `Form`.

> Index — full source of each example is one click away in `../examples/signal-forms--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Reads state from the **same `[formField]` binding** — the field is written once, not twice.
- ✅ Drives `Field`'s `data-invalid` / `data-disabled` / `data-required` / `data-dirty` / `data-touched`
  and the error _content_ (`rdxFieldError.messages()`) from the bound Signal Forms field.
- ✅ Aggregates form-level `data-invalid` / `data-dirty` / `data-touched` / `data-submitting` and routes
  field errors by `name`.
- ✅ Optionally delegates submission to Angular's public `submit()` lifecycle — validation, touched state,
  concurrent-submit protection, `submitting()`, and returned submission errors remain Angular-owned.
- ✅ Resets values and control-owned touched/dirty state through Angular's `FieldState.reset()`.
- ✅ Mirrors the complete classic `NgControl` UI lifecycle on every dual control: dirty/touched,
  reset/pristine/untouched, valid/invalid/pending/disabled, and normalized validation errors.
- ✅ Leaves `@angular/forms` out of every other entry — install it only when you use this one.

## Import

```ts
import { RdxSignalField, RdxSignalForm } from '@radix-ng/primitives/signal-forms';
```

## Anatomy

`rdxSignalField` sits on the control next to `[formField]`; `rdxSignalForm` sits on the form root next to
`rdxFormRoot`. No state is bound by hand — both read it from Signal Forms.

Reactive Forms and `ngModel` use the parallel `rdxNgControlField` adapter from
`@radix-ng/primitives/field`; the Field presentation contract is identical on both paths.

```html
<form rdxFormRoot [rdxSignalForm]="loginForm">
    <div rdxFieldRoot>
        <label rdxFieldLabel>Email</label>
        <input rdxFieldControl [formField]="loginForm.email" rdxSignalField />
        <p rdxFieldDescription>Use your account email.</p>
        <p rdxFieldError #err="rdxFieldError">{{ err.messages().join(' ') }}</p>
    </div>
</form>
```

## Examples

- [Field driven by Signal Forms](../examples/signal-forms--field-driven-by-signal-forms.md)
- [Two ways to surface field errors](../examples/signal-forms--two-ways-to-surface-field-errors.md)
- [When validity is displayed (`validationMode`)](../examples/signal-forms--when-validity-is-displayed-validationmode.md)
- [Angular-owned submission (`rdxSignalSubmit`)](../examples/signal-forms--angular-owned-submission-rdxsignalsubmit.md)
- [Pending async validation](../examples/signal-forms--pending-async-validation.md)
- [Async validation and reset lifecycle](../examples/signal-forms--async-validation-and-reset-lifecycle.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/signal-forms.json`
- Styling (parts + `data-*`): `references/styling-contract/signal-forms.json`
