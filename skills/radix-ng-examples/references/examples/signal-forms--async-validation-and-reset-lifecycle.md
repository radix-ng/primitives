# Signal Forms — Async validation and reset lifecycle

> One example from the [Signal Forms](../components/signal-forms.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

The Signal Forms side of the paired recipe above runs an Angular `validateAsync` resource, exposes
`pending()` as progress UI, submits through `rdxSignalSubmit`, and restores both the model and
interaction state from a native reset button.

Signal Forms deliberately does not guess an application's initial model. Handle the native reset event,
prevent the browser from independently restoring DOM defaults, and pass the desired value to Angular:

```html
<form
  rdxFormRoot
  [rdxSignalForm]="profileForm"
  (reset)="resetProfile($event)"
  rdxSignalSubmit
>
  <!-- Fieldset → Field → Control -->
  <button type="reset">Reset</button>
</form>
```

```ts
resetProfile(event: Event) {
  event.preventDefault();
  this.profileForm().reset({ username: '', email: '' });
}
```

Angular aborts pending field validation, restores the supplied values, and marks descendants untouched
and pristine. Each Radix NG control's reset integration clears its own interaction tracking as part of
the same lifecycle; `rdxFormRoot` also clears submit-attempt and external-error presentation on the reset
event.

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
