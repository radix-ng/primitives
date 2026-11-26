# Signal Forms — Pending async validation

> One example from the [Signal Forms](../components/signal-forms.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Signal Forms exposes `pending()` directly. Radix NG does not invent a `data-pending` attribute that Base
UI does not publish; it uses pending internally only to preserve tri-state validity. While validation is
pending, Field and control publish neither `data-valid` nor `data-invalid`.

```html
@if (accountForm.email().pending()) {
  <p role="status">Checking email…</p>
}
```

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
