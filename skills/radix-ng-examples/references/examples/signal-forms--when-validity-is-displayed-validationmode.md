# Signal Forms — When validity is displayed (`validationMode`)

> One example from the [Signal Forms](../components/signal-forms.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

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

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>

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
export const formLabel = 'text-foreground text-sm font-medium';
export const formError = 'text-destructive text-sm';
export const formInput =
    'demo-input h-9 w-full px-3 data-[invalid]:border-destructive data-[invalid]:ring-destructive/30';
export const formSubmit = 'demo-button demo-button-primary h-9 px-4 self-start';
export const formReset = 'demo-button demo-button-outline h-9 px-4';
```
