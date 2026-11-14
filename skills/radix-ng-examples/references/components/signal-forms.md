# Signal Forms

Bridge Angular [Signal Forms](https://angular.dev/guide/forms/signals/overview) into headless `Field` and `Form`.

> Index — full source of each example is one click away in `../examples/signal-forms--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Reads state from the **same `[formField]` binding** — the field is written once, not twice.
- ✅ Drives `Field`'s `data-invalid` / `data-disabled` / `data-required` / `data-dirty` / `data-touched`
  and the error _content_ (`rdxFieldError.messages()`) from the bound Signal Forms field.
- ✅ Aggregates form-level `data-invalid` / `data-dirty` / `data-touched` / `data-submitting` and routes
  field errors by `name`.
- ✅ Optionally delegates submission to Angular's public `submit()` lifecycle — validation, touched state,
  concurrent-submit protection, `submitting()`, and returned submission errors remain Angular-owned.
- ✅ Resets values and control-owned touched/dirty state through Angular's `FieldState.reset()`.
- ✅ Mirrors the complete classic `NgControl` UI lifecycle on every dual control: dirty/touched,
  reset/pristine/untouched, valid/invalid/pending/disabled, and normalized validation errors.
- ✅ Leaves `@angular/forms` out of every other entry — install it only when you use this one.

## Import

```ts
import { RdxSignalField, RdxSignalForm } from '@radix-ng/primitives/signal-forms';
```

## Control integration matrix

The matrix is executable, not just structural TypeScript compatibility. Every Signal Forms row has
per-control value/reset specs plus a cross-control visible-state spec for `[formField] rdxSignalField`.
Every classic row is also mounted on its real control root in an 11-control conformance spec for
`formControlName + rdxNgControlField`: errors, dirty/touched, disabled neutrality, inferred names, and
reset all travel through the same Field contract.

The value column shows the value to put in an Angular **Signal Forms model**. Angular deliberately
treats an `undefined` object property as an absent optional `FieldTree`, so do not initialize a bound
leaf to `undefined`. Use the control's concrete empty value: `''`, `[]`, or `null`.

| Control        | Signal model value                   | `[formField]` + `rdxSignalField` | `formControl` / `ngModel` + `rdxNgControlField` | Signal `reset()` |
| -------------- | ------------------------------------ | -------------------------------- | ------------------------------------------------ | ---------------- |
| Input          | `string` (empty: `''`)               | ✅                               | ✅ native                                        | ✅               |
| Checkbox       | `boolean`                            | ✅                               | ✅ CVA                                           | ✅               |
| Checkbox Group | `string[]`                           | ✅                               | ✅ CVA                                           | ✅               |
| Switch         | `boolean`                            | ✅                               | ✅ CVA                                           | ✅               |
| Radio Group    | `string \| null`                     | ✅                               | ✅ CVA                                           | ✅               |
| Select         | value / value array / `null` or `[]` | ✅                               | ✅ CVA                                           | ✅               |
| Toggle Group   | `string[]` (empty: `[]`)             | ✅                               | ✅ CVA                                           | ✅               |
| Slider         | `number \| number[]`                 | ✅                               | ✅ CVA                                           | ✅               |
| Number Field   | `number \| null`                     | ✅                               | ✅ CVA                                           | ✅               |
| Combobox       | value / value array / `null`         | ✅                               | ✅ CVA                                           | ✅               |
| Autocomplete   | `string` (empty: `''`)               | ✅                               | ✅ CVA                                           | ✅               |
| Date Field     | `DateValue \| null`                  | ✅                               | —                                                | ✅               |
| Time Field     | `TimeValue \| null`                  | ✅                               | —                                                | ✅               |
| Editable       | `string` (empty: `''`)               | ✅                               | —                                                | ✅               |

An em dash is intentional: `date-field`, `time-field`, and `editable` expose the Angular-native
`value = model()` contract but do not ship a `ControlValueAccessor`. Date and Time Field use `null` for
their empty value specifically so an empty Signal Forms field remains addressable.

## Anatomy

`rdxSignalField` sits on the control next to `[formField]`; `rdxSignalForm` sits on the form root next to
`rdxFormRoot`. No state is bound by hand — both read it from Signal Forms.

Reactive Forms and `ngModel` use the parallel `rdxNgControlField` adapter from
`@radix-ng/primitives/field`; the Field presentation contract is identical on both paths.

```html
<form rdxFormRoot [rdxSignalForm]="loginForm">
    <div rdxFieldRoot>
        <label rdxFieldLabel>Email</label>
        <input rdxFieldControl [formField]="loginForm.email" rdxSignalField />
        <p rdxFieldDescription>Use your account email.</p>
        <p rdxFieldError #err="rdxFieldError">{{ err.messages().join(' ') }}</p>
    </div>
</form>
```

## One recipe, two Angular APIs

The two account recipes below intentionally keep the same controls, `Form → Fieldset → Field →
Control` anatomy, validation messages, async username check, backend email error, interaction status,
submission feedback, and reset behavior. Only the Angular form API that owns value, validation, and
submission changes.

Try `admin` to see asynchronous validation and `taken@example.com` to see a submission error that
clears when the field is edited.

| Concern          | Reactive Forms                    | Signal Forms                               |
| ---------------- | --------------------------------- | ------------------------------------------ |
| Form binding     | `[formGroup]`                     | `form()` + `[rdxSignalForm]`                |
| Control binding  | `formControlName`                 | `[formField]`                              |
| Field adapter    | `rdxNgControlField`               | `rdxSignalField`                           |
| Validation       | `Validators` + `AsyncValidatorFn` | `required` / `minLength` / `validateAsync` |
| Submit lifecycle | `(ngSubmit)`                      | `rdxSignalSubmit` + `submission.action`    |
| Backend error    | `rdxFormRoot[errors]`             | Targeted `ValidationError` from the action |
| Pending state    | `control.pending`                 | `field().pending()`                        |
| Reset            | `FormGroup` + native form reset   | `FieldState.reset(initialValue)`           |

### Reactive Forms

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AsyncValidatorFn, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxNgControlField
} from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxInputDirective } from '@radix-ng/primitives/input';
import { RdxFormErrors, RdxFormRoot } from '../index';
import {
    type AccountFormValue,
    formError,
    formField,
    formInput,
    formLabel,
    formReset,
    formSubmit,
    simulateFormRequest,
    takenEmail,
    unavailableUsername
} from './form.shared';

/**
 * Complete Reactive Forms lifecycle: NgControl → Field state, async validation, server errors that
 * clear on edit, submit reveal/focus, and Angular-owned reset.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-reactive-forms-example',
    imports: [
        ReactiveFormsModule,
        RdxFormRoot,
        RdxFieldsetRoot,
        RdxFieldsetLegend,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxInputDirective,
        RdxFieldDescription,
        RdxFieldError,
        RdxNgControlField
    ],
    template: `
        <form
            class="flex w-full max-w-96 flex-col gap-4"
            [formGroup]="form"
            [errors]="serverErrors()"
            (onClearErrors)="clearServerErrors($event)"
            (ngSubmit)="submit()"
            (reset)="resetFeedback()"
            rdxFormRoot
        >
            <fieldset
                class="border-border flex flex-col gap-4 rounded-md border p-4"
                [disabled]="submitting()"
                rdxFieldsetRoot
            >
                <legend class="text-foreground px-1 text-sm font-semibold" rdxFieldsetLegend>Account</legend>

                <div [class]="field" rdxFieldRoot required>
                    <label [class]="label" rdxFieldLabel>Username</label>
                    <input
                        [class]="input"
                        autocomplete="username"
                        formControlName="username"
                        rdxInput
                        rdxNgControlField
                    />
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>
                        Use
                        <code>admin</code>
                        to preview asynchronous validation.
                    </p>
                    @if (username.pending) {
                        <p class="text-muted-foreground text-sm" role="status">Checking availability…</p>
                    }
                    <p [class]="error" match="required" rdxFieldError>Username is required.</p>
                    <p [class]="error" match="minlength" rdxFieldError>Use at least 3 characters.</p>
                    <p #usernameError="rdxFieldError" [class]="error" match="unavailable" rdxFieldError>
                        {{ usernameError.messages().join(' ') }}
                    </p>
                </div>

                <div [class]="field" rdxFieldRoot required>
                    <label [class]="label" rdxFieldLabel>Email</label>
                    <input
                        [class]="input"
                        autocomplete="email"
                        type="email"
                        formControlName="email"
                        rdxInput
                        rdxNgControlField
                    />
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>
                        Use
                        <code>taken@example.com</code>
                        to preview a server error.
                    </p>
                    <p #emailError="rdxFieldError" [class]="error" rdxFieldError>
                        @if (email.hasError('required')) {
                            Email is required.
                        } @else if (email.hasError('email')) {
                            Enter a valid email address.
                        } @else {
                            {{ emailError.messages().join(' ') }}
                        }
                    </p>
                </div>
            </fieldset>

            <div class="flex items-center gap-2">
                <button [class]="submitButton" [disabled]="submitting()" type="submit">
                    {{ submitting() ? 'Submitting…' : 'Submit' }}
                </button>
                <button [class]="resetButton" [disabled]="submitting()" type="reset">Reset</button>
            </div>

            <p class="text-muted-foreground text-xs" aria-live="polite">
                {{ form.dirty ? 'Dirty' : 'Pristine' }} ·
                {{ form.touched ? 'Touched' : 'Untouched' }}
            </p>

            @if (savedAccount(); as account) {
                <p class="text-foreground text-sm" role="status">Submitted {{ account.username }}.</p>
            }
        </form>
    `
})
export class FormReactiveFormsExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly error = formError;
    protected readonly submitButton = formSubmit;
    protected readonly resetButton = formReset;

    private readonly formBuilder = inject(FormBuilder);
    private readonly usernameAvailability: AsyncValidatorFn = async (control) => {
        await simulateFormRequest();
        return String(control.value).trim().toLowerCase() === unavailableUsername
            ? { unavailable: { message: 'That username is unavailable.' } }
            : null;
    };

    readonly serverErrors = signal<RdxFormErrors>({});
    readonly savedAccount = signal<AccountFormValue | null>(null);
    readonly submitting = signal(false);
    readonly form = this.formBuilder.nonNullable.group({
        username: this.formBuilder.nonNullable.control('', {
            validators: [Validators.required, Validators.minLength(3)],
            asyncValidators: [this.usernameAvailability]
        }),
        email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email])
    });

    protected get username() {
        return this.form.controls.username;
    }

    protected get email() {
        return this.form.controls.email;
    }

    protected clearServerErrors(errors: RdxFormErrors): void {
        this.serverErrors.set(errors);
        this.savedAccount.set(null);
    }

    protected async submit(): Promise<void> {
        if (this.form.pending || this.form.invalid) {
            this.form.markAllAsTouched();
            this.savedAccount.set(null);
            return;
        }

        if (this.submitting()) {
            return;
        }

        this.submitting.set(true);
        this.savedAccount.set(null);

        try {
            await simulateFormRequest();

            if (this.email.value === takenEmail) {
                this.serverErrors.set({ email: 'That email already has an account.' });
                return;
            }

            this.serverErrors.set({});
            this.savedAccount.set(this.form.getRawValue());
        } finally {
            this.submitting.set(false);
        }
    }

    protected resetFeedback(): void {
        this.serverErrors.set({});
        this.savedAccount.set(null);
    }
}
```

### Signal Forms

```typescript
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
```

## Examples

- [Field driven by Signal Forms](../examples/signal-forms--field-driven-by-signal-forms.md)
- [Two ways to surface field errors](../examples/signal-forms--two-ways-to-surface-field-errors.md)
- [When validity is displayed (`validationMode`)](../examples/signal-forms--when-validity-is-displayed-validationmode.md)
- [Angular-owned submission (`rdxSignalSubmit`)](../examples/signal-forms--angular-owned-submission-rdxsignalsubmit.md)
- [Pending async validation](../examples/signal-forms--pending-async-validation.md)
- [Async validation and reset lifecycle](../examples/signal-forms--async-validation-and-reset-lifecycle.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/signal-forms.json`
- Styling (parts + `data-*`): `references/styling-contract/signal-forms.json`
