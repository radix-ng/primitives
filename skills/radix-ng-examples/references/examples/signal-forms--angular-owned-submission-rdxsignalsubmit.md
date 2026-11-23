# Signal Forms — Angular-owned submission (`rdxSignalSubmit`)

> One example from the [Signal Forms](../components/signal-forms.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Add the opt-in `rdxSignalSubmit` input when the form created by `form()` defines a
`submission.action`. The adapter delegates the native submit to Angular's public `submit()` API; it does
not also emit `rdxFormRoot.onFormSubmit`, avoiding duplicate user side effects.

```html
<form rdxFormRoot [rdxSignalForm]="accountForm" rdxSignalSubmit>
  <!-- fields -->
  <button type="submit" [disabled]="accountForm().submitting()">
    {{ accountForm().submitting() ? 'Saving…' : 'Save' }}
  </button>
</form>
```

```ts
readonly accountForm = form(
  this.model,
  (path) => required(path.email, { message: 'Email is required.' }),
  {
    submission: {
      action: async (field) => {
        const result = await this.api.createAccount(field().value());
        if (result.emailTaken) {
          return {
            kind: 'emailTaken',
            message: 'This email is already registered.',
            fieldTree: field.email
          };
        }
      }
    }
  }
);
```

Angular marks interactive fields touched, blocks invalid forms, guards concurrent submits, updates
`submitting()`, and attaches returned errors to their `fieldTree`. Radix NG keeps the Base UI-facing
responsibilities: error presentation, accessible relationships, and first-invalid focus.

`rdxSignalSubmit` is deliberately opt-in in 1.x. Without it, `[rdxSignalForm]` remains a state adapter
and `rdxFormRoot` keeps its existing `(onFormSubmit)` path.

The separate `rdxFormRoot[errors]` channel remains Base UI-compatible in either mode: a visible external
error blocks delegation until the field is edited and that error is cleared.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { email as emailFormat, form, FormField, required } from '@angular/forms/signals';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { RdxSignalField, RdxSignalForm } from '@radix-ng/primitives/signal-forms';

const takenEmail = 'taken@radix-ng.com';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'signal-forms-submission-example',
    imports: [
        FormField,
        RdxFormRoot,
        RdxSignalForm,
        RdxFieldRoot,
        RdxSignalField,
        RdxFieldLabel,
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError
    ],
    template: `
        <form class="flex w-80 flex-col gap-3" [rdxSignalForm]="accountForm" rdxFormRoot rdxSignalSubmit>
            <div class="flex flex-col gap-2" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium data-[disabled]:opacity-50" rdxFieldLabel>
                    Email
                </label>
                <input
                    class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/20 h-9 w-full px-3"
                    [formField]="accountForm.email"
                    rdxFieldControl
                    rdxSignalField
                    type="email"
                />
                <p class="text-muted-foreground text-sm" rdxFieldDescription>
                    Use {{ takenEmail }} to preview a server error.
                </p>
                <p class="text-destructive text-sm" #err="rdxFieldError" rdxFieldError>
                    {{ err.messages().join(' ') }}
                </p>
            </div>

            <button
                class="demo-button demo-button-primary h-9 self-start px-4 disabled:cursor-wait disabled:opacity-60"
                [disabled]="accountForm().submitting()"
                type="submit"
            >
                {{ accountForm().submitting() ? 'Creating account…' : 'Create account' }}
            </button>

            @if (submittedEmail(); as email) {
                <p class="text-muted-foreground text-sm" role="status">Account created for {{ email }}.</p>
            }
        </form>
    `
})
export class SignalFormsSubmissionExample {
    protected readonly takenEmail = takenEmail;

    protected readonly submittedEmail = signal<string | null>(null);
    readonly model = signal({ email: '' });
    readonly accountForm = form(
        this.model,
        (path) => {
            required(path.email, { message: 'Email is required.' });
            emailFormat(path.email, { message: 'Enter a valid email address.' });
        },
        {
            submission: {
                action: async (field) => {
                    this.submittedEmail.set(null);
                    await new Promise((resolve) => setTimeout(resolve, 600));

                    const email = field.email().value();
                    if (email.toLowerCase() === takenEmail) {
                        return {
                            kind: 'emailTaken',
                            message: 'This email is already registered.',
                            fieldTree: field.email
                        };
                    }

                    this.submittedEmail.set(email);
                    return undefined;
                }
            }
        }
    );
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
export const formLabel = 'text-foreground text-sm font-medium';
export const formError = 'text-destructive text-sm';
export const formInput =
    'demo-input h-9 w-full px-3 data-[invalid]:border-destructive data-[invalid]:ring-destructive/30';
export const formSubmit = 'demo-button demo-button-primary h-9 px-4 self-start';
export const formReset = 'demo-button demo-button-outline h-9 px-4';
```
