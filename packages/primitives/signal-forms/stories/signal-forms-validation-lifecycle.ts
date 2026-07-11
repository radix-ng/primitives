import { ChangeDetectionStrategy, Component, resource, signal } from '@angular/core';
import { email as emailFormat, form, FormField, minLength, required, validateAsync } from '@angular/forms/signals';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { RdxInputDirective } from '@radix-ng/primitives/input';
import {
    type AccountFormValue,
    formError,
    formField,
    formInput,
    formLabel,
    formReset,
    formSubmit,
    initialAccountValue,
    simulateFormRequest,
    takenEmail,
    unavailableUsername
} from '../../form/stories/form.shared';
import { RdxSignalField } from '../src/signal-field';
import { RdxSignalForm } from '../src/signal-form';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'signal-forms-validation-lifecycle-example',
    imports: [
        FormField,
        RdxFormRoot,
        RdxSignalForm,
        RdxFieldsetRoot,
        RdxFieldsetLegend,
        RdxFieldRoot,
        RdxSignalField,
        RdxFieldLabel,
        RdxInputDirective,
        RdxFieldDescription,
        RdxFieldError
    ],
    template: `
        <form
            class="flex w-full max-w-96 flex-col gap-4"
            [rdxSignalForm]="accountForm"
            (reset)="resetAccount($event)"
            rdxFormRoot
            rdxSignalSubmit
        >
            <fieldset
                class="border-border flex flex-col gap-4 rounded-md border p-4"
                [disabled]="accountForm().submitting()"
                rdxFieldsetRoot
            >
                <legend class="text-foreground px-1 text-sm font-semibold" rdxFieldsetLegend>Account</legend>

                <div [class]="field" rdxFieldRoot required>
                    <label [class]="label" rdxFieldLabel>Username</label>
                    <input
                        [class]="input"
                        [formField]="accountForm.username"
                        autocomplete="username"
                        rdxInput
                        rdxSignalField
                    />
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>
                        Use
                        <code>admin</code>
                        to preview asynchronous validation.
                    </p>
                    @if (accountForm.username().pending()) {
                        <p class="text-muted-foreground text-sm" role="status">Checking availability…</p>
                    }
                    <p #usernameError="rdxFieldError" [class]="error" rdxFieldError>
                        {{ usernameError.messages().join(' ') }}
                    </p>
                </div>

                <div [class]="field" rdxFieldRoot required>
                    <label [class]="label" rdxFieldLabel>Email</label>
                    <input
                        [class]="input"
                        [formField]="accountForm.email"
                        autocomplete="email"
                        rdxInput
                        rdxSignalField
                        type="email"
                    />
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>
                        Use
                        <code>taken@example.com</code>
                        to preview a server error.
                    </p>
                    <p #emailError="rdxFieldError" [class]="error" rdxFieldError>
                        {{ emailError.messages().join(' ') }}
                    </p>
                </div>
            </fieldset>

            <div class="flex items-center gap-2">
                <button [class]="submitButton" [disabled]="accountForm().submitting()" type="submit">
                    {{ accountForm().submitting() ? 'Submitting…' : 'Submit' }}
                </button>
                <button [class]="resetButton" [disabled]="accountForm().submitting()" type="reset">Reset</button>
            </div>

            <p class="text-muted-foreground text-xs" aria-live="polite">
                {{ accountForm().dirty() ? 'Dirty' : 'Pristine' }} ·
                {{ accountForm().touched() ? 'Touched' : 'Untouched' }}
            </p>

            @if (savedAccount(); as account) {
                <p class="text-foreground text-sm" role="status">Submitted {{ account.username }}.</p>
            }
        </form>
    `
})
export class SignalFormsValidationLifecycleExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly error = formError;
    protected readonly submitButton = formSubmit;
    protected readonly resetButton = formReset;

    protected readonly savedAccount = signal<AccountFormValue | null>(null);
    readonly model = signal<AccountFormValue>(initialAccountValue());
    readonly accountForm = form(
        this.model,
        (path) => {
            required(path.username, { message: 'Username is required.' });
            minLength(path.username, 3, { message: 'Use at least 3 characters.' });
            validateAsync(path.username, {
                params: ({ value }) => {
                    const username = value().trim();
                    return username.length >= 3 ? username : undefined;
                },
                factory: (params) =>
                    resource({
                        params: () => params(),
                        loader: async ({ params }) => {
                            await simulateFormRequest();
                            return params.toLowerCase() !== unavailableUsername;
                        }
                    }),
                onSuccess: (available) =>
                    available ? undefined : { kind: 'unavailable', message: 'That username is unavailable.' },
                onError: () => ({ kind: 'availabilityUnavailable', message: 'Could not check this username.' })
            });

            required(path.email, { message: 'Email is required.' });
            emailFormat(path.email, { message: 'Enter a valid email address.' });
        },
        {
            submission: {
                action: async (field) => {
                    this.savedAccount.set(null);
                    await simulateFormRequest();

                    if (field.email().value() === takenEmail) {
                        return {
                            kind: 'emailTaken',
                            message: 'That email already has an account.',
                            fieldTree: field.email
                        };
                    }

                    this.savedAccount.set({ ...field().value() });
                    return undefined;
                }
            }
        }
    );

    protected resetAccount(event: Event): void {
        // Signal Forms owns the model and interaction state. Prevent the browser from independently
        // restoring DOM defaults, then reset Angular with the explicit application initial value.
        event.preventDefault();
        this.savedAccount.set(null);
        this.accountForm().reset(initialAccountValue());
    }
}
