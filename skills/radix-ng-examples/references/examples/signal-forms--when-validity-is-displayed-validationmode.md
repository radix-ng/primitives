# Signal Forms — When validity is displayed (`validationMode`)

> One example from the [Signal Forms](../components/signal-forms.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

`rdxSignalField` reports the field's **actual** state; the `Field` decides **when** to surface it from
its `validationMode` (set on `rdxFormRoot`, or per field on `rdxFieldRoot`). The default is `'onBlur'`:
an empty required field stays **neutral** — neither `data-valid` nor `data-invalid`, `rdxFieldError`
hidden (Base UI's tri-state `valid: boolean | null`) — until it is touched or the form is submitted, then
it reflects real validity. No manual `[invalid]`/`[touched]` wiring.

| Mode         | Reveals validity when…                          |
| ------------ | ----------------------------------------------- |
| `'always'`   | immediately (eager)                             |
| `'onChange'` | the value changes (dirty), or touched/submitted |
| `'onBlur'`   | the field is touched, or submitted (default)    |
| `'onSubmit'` | a submit has been attempted                     |

```html
<!-- onBlur is the default; set another mode on the form (or a field) to override -->
<form rdxFormRoot validationMode="onSubmit">…</form>
```

The Form records the submit attempt **before** checking validity, so an invalid pristine submit is
blocked (and the first invalid field focused) and its errors revealed — the submit handler needs no
`markAsTouched()` ritual:

```ts
onSubmit() {
    // Only runs on a valid submit; rdxFormRoot blocks + reveals errors otherwise.
}
```

> Only server/external errors (`rdxFormRoot`'s `errors` input) bypass the gate — they show immediately.
> Client validation is mode-gated whether it flows through the per-field `rdxSignalField` **or** the
> form-level `rdxSignalForm` name-routing.
