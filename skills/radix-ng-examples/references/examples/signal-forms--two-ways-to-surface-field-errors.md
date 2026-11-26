# Signal Forms — Two ways to surface field errors

> One example from the [Signal Forms](../components/signal-forms.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

There are **two modes** for routing a field's validation messages into `rdxFieldError.messages()` — pick
**one per field**:

1. **Per-field adapter** — put `rdxSignalField` on the control. It reads the bound field's `errors()`
   directly and registers them on the enclosing `rdxFieldRoot`. Use this when the field already needs the
   adapter for `data-invalid` / `data-touched` / `data-dirty` state (the common case).
2. **Form-level name routing** — set a `name` on `rdxFieldRoot` that matches the field key; the
   `rdxSignalForm` adapter's `errorsFor(name)` resolves it (dotted paths like `address.street` work). Use
   this when a field only needs its _messages_ from the form and not the per-field state attributes — no
   `rdxSignalField` needed.

Using **both** for the same field is harmless — `messages()` deduplicates by text, so a message shared by
the two sources renders once — but prefer a single mode for clarity.

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
