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
import { cn, demoButton, demoInput } from '../../storybook/styles';
import { RdxSignalField } from '../src/signal-field';
import { RdxSignalForm } from '../src/signal-form';

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
                <label [class]="labelClass" rdxFieldLabel>Email</label>
                <input
                    [class]="inputClass"
                    [formField]="accountForm.email"
                    rdxFieldControl
                    rdxSignalField
                    type="email"
                />
                <p [class]="descriptionClass" rdxFieldDescription>Use {{ takenEmail }} to preview a server error.</p>
                <p #err="rdxFieldError" [class]="errorClass" rdxFieldError>{{ err.messages().join(' ') }}</p>
            </div>

            <button [class]="buttonClass" [disabled]="accountForm().submitting()" type="submit">
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
    protected readonly inputClass = cn(
        demoInput,
        'data-[invalid]:border-destructive data-[invalid]:ring-destructive/20'
    );
    protected readonly buttonClass = cn(
        demoButton.base,
        demoButton.primary,
        demoButton.size.md,
        'self-start disabled:cursor-wait disabled:opacity-60'
    );
    protected readonly labelClass = 'text-foreground text-sm font-medium data-[disabled]:opacity-50';
    protected readonly descriptionClass = 'text-muted-foreground text-sm';
    protected readonly errorClass = 'text-destructive text-sm';

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
