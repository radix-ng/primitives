# Signal Forms — When validity is displayed (`validationMode`)

> One example from the [Signal Forms](../components/signal-forms.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

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

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

#### `../../form/stories/form.shared.ts`

```typescript
export interface AccountFormValue {
    username: string;
    email: string;
}

export const initialAccountValue = (): AccountFormValue => ({ username: '', email: '' });
export const unavailableUsername = 'admin';
export const takenEmail = 'taken@example.com';
export const simulateFormRequest = (duration = 500): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, duration));

export const formField = 'flex flex-col gap-1.5';
export const formLabel = 'text-foreground text-sm font-bold';
export const formError = 'text-destructive text-sm';
export const formInput =
    'demo-input h-8 w-full px-2 data-[invalid]:border-destructive data-[invalid]:ring-destructive/30';
export const formSubmit = 'demo-button demo-button-primary h-8 px-3 self-start';
export const formReset = 'demo-button demo-button-outline h-8 px-3';
```
