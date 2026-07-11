import { ChangeDetectionStrategy, Component, resource, signal } from '@angular/core';
import { email as emailFormat, form, FormField, minLength, required, validateAsync } from '@angular/forms/signals';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { RdxInputDirective } from '@radix-ng/primitives/input';
import { cn, demoButton, demoInput } from '../../storybook/styles';
import { RdxSignalField } from '../src/signal-field';
import { RdxSignalForm } from '../src/signal-form';

interface ProfileModel {
    username: string;
    email: string;
}

const initialProfile = (): ProfileModel => ({ username: '', email: '' });
const unavailableUsernames = new Set(['admin', 'radix', 'angular']);

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
            class="flex w-80 flex-col gap-4"
            [rdxSignalForm]="profileForm"
            (reset)="resetProfile($event)"
            rdxFormRoot
            rdxSignalSubmit
        >
            <fieldset
                class="border-border flex flex-col gap-4 rounded-md border p-4"
                [disabled]="profileForm().submitting()"
                rdxFieldsetRoot
            >
                <legend class="text-foreground px-1 text-sm font-semibold" rdxFieldsetLegend>Public profile</legend>

                <div class="flex flex-col gap-2" rdxFieldRoot name="username" validationMode="onChange">
                    <label [class]="labelClass" rdxFieldLabel>Username</label>
                    <input
                        [class]="inputClass"
                        [formField]="profileForm.username"
                        autocomplete="username"
                        rdxInput
                        rdxSignalField
                    />
                    @if (profileForm.username().pending()) {
                        <p class="text-muted-foreground text-sm" role="status">Checking availability…</p>
                    } @else {
                        <p [class]="descriptionClass" rdxFieldDescription>
                            Try
                            <span class="text-foreground font-medium">angular</span>
                            to see an async error.
                        </p>
                    }
                    <p #usernameError="rdxFieldError" [class]="errorClass" rdxFieldError>
                        {{ usernameError.messages().join(' ') }}
                    </p>
                </div>

                <div class="flex flex-col gap-2" rdxFieldRoot name="email">
                    <label [class]="labelClass" rdxFieldLabel>Email</label>
                    <input
                        [class]="inputClass"
                        [formField]="profileForm.email"
                        autocomplete="email"
                        rdxInput
                        rdxSignalField
                        type="email"
                    />
                    <p [class]="descriptionClass" rdxFieldDescription>Used only for account notifications.</p>
                    <p #emailError="rdxFieldError" [class]="errorClass" rdxFieldError>
                        {{ emailError.messages().join(' ') }}
                    </p>
                </div>
            </fieldset>

            <div class="flex items-center gap-2">
                <button [class]="primaryButtonClass" [disabled]="profileForm().submitting()" type="submit">
                    {{ profileForm().submitting() ? 'Saving…' : 'Save profile' }}
                </button>
                <button [class]="secondaryButtonClass" type="reset">Reset</button>
            </div>

            <p class="text-muted-foreground text-xs" aria-live="polite">
                {{ profileForm().dirty() ? 'Dirty' : 'Pristine' }} ·
                {{ profileForm().touched() ? 'Touched' : 'Untouched' }}
            </p>

            @if (savedProfile(); as profile) {
                <p class="text-foreground text-sm" role="status">Saved {{ profile.username }}.</p>
            }
        </form>
    `
})
export class SignalFormsValidationLifecycleExample {
    protected readonly inputClass = cn(
        demoInput,
        'data-[invalid]:border-destructive data-[invalid]:ring-destructive/20'
    );
    protected readonly primaryButtonClass = cn(
        demoButton.base,
        demoButton.primary,
        demoButton.size.md,
        'disabled:cursor-wait disabled:opacity-60'
    );
    protected readonly secondaryButtonClass = cn(demoButton.base, demoButton.secondary, demoButton.size.md);
    protected readonly labelClass = 'text-foreground text-sm font-medium data-[disabled]:opacity-50';
    protected readonly descriptionClass = 'text-muted-foreground text-sm';
    protected readonly errorClass = 'text-destructive text-sm';

    protected readonly savedProfile = signal<ProfileModel | null>(null);
    readonly model = signal<ProfileModel>(initialProfile());
    readonly profileForm = form(
        this.model,
        (path) => {
            required(path.username, { message: 'Username is required.' });
            minLength(path.username, 3, { message: 'Use at least 3 characters.' });
            validateAsync(path.username, {
                params: ({ value }) => value(),
                debounce: 250,
                factory: (params) =>
                    resource({
                        params: () => params(),
                        loader: async ({ params }) => {
                            await new Promise((resolve) => setTimeout(resolve, 650));
                            return !unavailableUsernames.has(params.toLowerCase());
                        }
                    }),
                onSuccess: (available) =>
                    available ? undefined : { kind: 'usernameTaken', message: 'This username is already taken.' },
                onError: () => ({ kind: 'availabilityUnavailable', message: 'Could not check this username.' })
            });

            required(path.email, { message: 'Email is required.' });
            emailFormat(path.email, { message: 'Enter a valid email address.' });
        },
        {
            submission: {
                action: async (field) => {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    this.savedProfile.set({ ...field().value() });
                    return undefined;
                }
            }
        }
    );

    protected resetProfile(event: Event): void {
        // Signal Forms owns the model and interaction state. Prevent the browser from independently
        // restoring DOM defaults, then reset Angular with the explicit application initial value.
        event.preventDefault();
        this.savedProfile.set(null);
        this.profileForm().reset(initialProfile());
    }
}
