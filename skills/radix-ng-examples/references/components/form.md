# Form

#### The top of the forms layer cake: aggregates fields, maps server errors by name, and intercepts submit and reset.

Form rides the native `<form>` element. It owns no values and runs no validation — Angular form
systems (or Field inputs) stay the source of validity. It maps external/server errors onto fields by
`name`, clears them as the user edits, serializes values on submit, focuses the first invalid field,
and resets field interaction state on native reset.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormErrors, RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formError, formField, formInput, formLabel, formSubmit } from './form.shared';

/**
 * Server-error mapping with clear-on-edit. The submit handler simulates a backend that rejects a
 * taken email; the returned error maps onto the matching field by `name`. Editing the field clears
 * its error, and binding `(onClearErrors)` back into `errors` keeps the controlled map in sync.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-default-example',
    imports: [RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldError],
    template: `
        <form
            class="flex w-80 flex-col gap-4"
            [errors]="errors()"
            (onFormSubmit)="onSubmit($event)"
            (onClearErrors)="errors.set($event)"
            rdxFormRoot
        >
            <div [class]="field" name="email" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Email</label>
                <input [class]="input" name="email" type="email" rdxFieldControl placeholder="name@example.com" />
                <p #emailError="rdxFieldError" [class]="error" rdxFieldError>{{ emailError.messages().join(' ') }}</p>
            </div>

            <button [class]="submit" type="submit">Create account</button>
            @if (success()) {
                <p class="text-muted-foreground text-sm">Account created for {{ success() }}.</p>
            }
        </form>
    `
})
export class FormDefaultExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly error = formError;
    protected readonly submit = formSubmit;

    readonly errors = signal<RdxFormErrors | null>(null);
    readonly success = signal<string | null>(null);

    onSubmit(event: RdxFormSubmitEvent): void {
        const email = String(event.values['email'] ?? '');
        // Simulated server response: this address is already taken.
        if (email === 'taken@example.com') {
            this.success.set(null);
            this.errors.set({ email: 'This email is already registered.' });
        } else {
            this.errors.set(null);
            this.success.set(email);
        }
    }
}
```

## Features

- ✅ Maps `errors` (server/external) onto fields by `name`; messages flow to `rdxFieldError`.
- ✅ Clears a field's external error as soon as the user edits it; `onClearErrors` emits the remaining map.
- ✅ Intercepts submit (`preventDefault`), emitting `onFormSubmit` with values serialized from `FormData`.
- ✅ Blocks submit when any field is invalid and focuses the first invalid field, in DOM order.
- ✅ Handles native `reset`: clears errors and re-syncs each field's touched/dirty/focused/filled state.
- ✅ Aggregate state via `data-invalid`, `data-dirty`, `data-touched`, and `data-submitting`.
- ✅ Form-system-agnostic: works with plain native controls, Reactive Forms (`(ngSubmit)` still fires), and template-driven forms.
- ✅ `rdxNgControlField` connects Reactive / template-driven controls to registered Fields without manual validity bindings.
- ✅ Signal Forms integration: an `RdxFormState` provider seam lets `[rdxSignalForm]` own the form's aggregate validity / dirty / touched / submitting and route per-field **client** errors by `name` (gated by `validationMode`). The `errors` input stays a separate eager **server** channel.

## Import

```typescript
import { RdxFormRoot } from '@radix-ng/primitives/form';
```

## Anatomy

Compose Form over Fieldset → Field → Control. Each field's `name` is the key the Form's `errors` map
matches against; the native control's `name` is what `FormData` serializes.

```html
<form rdxFormRoot [errors]="serverErrors">
    <fieldset rdxFieldsetRoot>
        <legend rdxFieldsetLegend>Account</legend>
        <div rdxFieldRoot name="email">
            <label rdxFieldLabel>Email</label>
            <input rdxFieldControl name="email" type="email" />
            <p rdxFieldError #err="rdxFieldError">{{ err.messages().join(' ') }}</p>
        </div>
    </fieldset>
    <button type="submit">Submit</button>
</form>
```

## Examples

### Server errors with clear-on-edit

The submit handler simulates a backend rejecting a taken email (try `taken@example.com`); the returned
error maps onto the field by `name` and clears when you edit it.

> Bind `errors` to a **stable reference** — a `signal`/property you reassign, not a getter or method
> that returns a fresh object every change detection. Form tracks which fields the user has cleared
> against the `errors` reference; a new reference resets that set (by design — the server "spoke again"),
> so an always-fresh reference would resurrect cleared errors on the next change-detection pass.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormErrors, RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formError, formField, formInput, formLabel, formSubmit } from './form.shared';

/**
 * Server-error mapping with clear-on-edit. The submit handler simulates a backend that rejects a
 * taken email; the returned error maps onto the matching field by `name`. Editing the field clears
 * its error, and binding `(onClearErrors)` back into `errors` keeps the controlled map in sync.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-default-example',
    imports: [RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldError],
    template: `
        <form
            class="flex w-80 flex-col gap-4"
            [errors]="errors()"
            (onFormSubmit)="onSubmit($event)"
            (onClearErrors)="errors.set($event)"
            rdxFormRoot
        >
            <div [class]="field" name="email" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Email</label>
                <input [class]="input" name="email" type="email" rdxFieldControl placeholder="name@example.com" />
                <p #emailError="rdxFieldError" [class]="error" rdxFieldError>{{ emailError.messages().join(' ') }}</p>
            </div>

            <button [class]="submit" type="submit">Create account</button>
            @if (success()) {
                <p class="text-muted-foreground text-sm">Account created for {{ success() }}.</p>
            }
        </form>
    `
})
export class FormDefaultExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly error = formError;
    protected readonly submit = formSubmit;

    readonly errors = signal<RdxFormErrors | null>(null);
    readonly success = signal<string | null>(null);

    onSubmit(event: RdxFormSubmitEvent): void {
        const email = String(event.values['email'] ?? '');
        // Simulated server response: this address is already taken.
        if (email === 'taken@example.com') {
            this.success.set(null);
            this.errors.set({ email: 'This email is already registered.' });
        } else {
            this.errors.set(null);
            this.success.set(email);
        }
    }
}
```

### Reset

Native `reset` clears external errors and every field's interaction state, and re-syncs `filled` to the
reverted values.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormErrors, RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formError, formField, formInput, formLabel, formReset, formSubmit } from './form.shared';

/**
 * Native `reset` clears external errors and every field's interaction state (touched/dirty/focused),
 * and re-syncs `filled` to the reverted values — no manual wiring. Submit a wrong code to surface a
 * server error, then press Reset; submit `1234` to pass.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-reset-example',
    imports: [RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldError],
    template: `
        <form
            class="flex w-80 flex-col gap-4"
            [errors]="errors()"
            (onFormSubmit)="onSubmit($event)"
            (onClearErrors)="errors.set($event)"
            (reset)="verified.set(false)"
            rdxFormRoot
        >
            <div [class]="field" name="code" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Access code</label>
                <input [class]="input" name="code" rdxFieldControl placeholder="1234" />
                <p #codeError="rdxFieldError" [class]="error" rdxFieldError>{{ codeError.messages().join(' ') }}</p>
            </div>

            <div class="flex gap-2">
                <button [class]="submit" type="submit">Verify</button>
                <button [class]="reset" type="reset">Reset</button>
            </div>
            @if (verified()) {
                <p class="text-muted-foreground text-sm">Code accepted.</p>
            }
        </form>
    `
})
export class FormResetExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly error = formError;
    protected readonly submit = formSubmit;
    protected readonly reset = formReset;

    readonly errors = signal<RdxFormErrors | null>(null);
    readonly verified = signal(false);

    onSubmit(event: RdxFormSubmitEvent): void {
        if (String(event.values['code'] ?? '') === '1234') {
            this.errors.set(null);
            this.verified.set(true);
        } else {
            this.verified.set(false);
            this.errors.set({ code: 'Invalid code, try 1234.' });
        }
    }
}
```

### Reactive Forms

The complete recipe composes Form → Fieldset → Field → Control with `rdxNgControlField`, async
validation, error-key matching, server errors that clear on edit, submit reveal/focus, and reset.
Reactive Forms remains the value/validation source of truth; Form never stops `(ngSubmit)` propagation.

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AsyncValidatorFn, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxNgControlField
} from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxFormErrors, RdxFormRoot } from '../index';
import { formError, formField, formInput, formLabel, formReset, formSubmit } from './form.shared';

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
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError,
        RdxNgControlField
    ],
    template: `
        <form
            class="flex w-96 flex-col gap-4"
            [formGroup]="form"
            [errors]="serverErrors()"
            (onClearErrors)="clearServerErrors($event)"
            (ngSubmit)="submit()"
            (reset)="successMessage.set('')"
            rdxFormRoot
        >
            <fieldset class="border-border space-y-4 rounded-md border p-4" rdxFieldsetRoot>
                <legend class="text-foreground px-1 text-sm font-semibold" rdxFieldsetLegend>Account</legend>

                <div [class]="field" rdxFieldRoot required>
                    <label [class]="label" rdxFieldLabel>Username</label>
                    <input
                        [class]="input"
                        autocomplete="username"
                        formControlName="username"
                        rdxFieldControl
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
                        rdxFieldControl
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

            <div class="flex gap-2">
                <button [class]="submitButton" type="submit">Submit</button>
                <button [class]="resetButton" type="reset">Reset</button>
            </div>

            @if (successMessage()) {
                <p class="text-foreground text-sm" role="status">{{ successMessage() }}</p>
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
        await new Promise((resolve) => setTimeout(resolve, 500));
        return String(control.value).trim().toLowerCase() === 'admin'
            ? { unavailable: { message: 'That username is unavailable.' } }
            : null;
    };

    readonly serverErrors = signal<RdxFormErrors>({});
    readonly successMessage = signal('');
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
        this.successMessage.set('');
    }

    protected submit(): void {
        if (this.form.pending || this.form.invalid) {
            this.form.markAllAsTouched();
            this.successMessage.set('');
            return;
        }

        if (this.email.value === 'taken@example.com') {
            this.serverErrors.set({ email: 'That email already has an account.' });
            this.successMessage.set('');
            return;
        }

        this.serverErrors.set({});
        this.successMessage.set(`Submitted ${this.username.value}.`);
    }
}
```

### Native controls

No `@angular/forms` at all — a valid submit serializes the form's `FormData` into a plain values object
(repeated names collapse into arrays).

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formField, formInput, formLabel, formSubmit } from './form.shared';

/**
 * No `@angular/forms` at all — just native controls. On a valid submit the Form serializes the form's
 * `FormData` into a plain values object (repeated `name`s collapse into arrays).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-native-controls-example',
    imports: [RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl],
    template: `
        <form class="flex w-80 flex-col gap-4" (onFormSubmit)="onSubmit($event)" rdxFormRoot>
            <div [class]="field" name="name" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Name</label>
                <input [class]="input" name="name" rdxFieldControl value="Ada" />
            </div>
            <div [class]="field" name="role" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Role</label>
                <input [class]="input" name="role" rdxFieldControl value="Engineer" />
            </div>

            <button [class]="submit" type="submit">Submit</button>
            @if (values()) {
                <pre class="bg-muted text-foreground rounded-md p-3 text-xs">{{ values() }}</pre>
            }
        </form>
    `
})
export class FormNativeControlsExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly submit = formSubmit;

    readonly values = signal<string | null>(null);

    onSubmit(event: RdxFormSubmitEvent): void {
        this.values.set(JSON.stringify(event.values, null, 2));
    }
}
```

## API Reference

### RdxFormRoot

`onFormSubmit` emits `{ values, reason, event }` (`reason` is always `'none'` for a user submit,
mirroring Base UI's submit `eventDetails`).

**Data attributes**

| Attribute         | Present when                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `data-invalid`    | Any registered field is invalid.                                         |
| `data-dirty`      | Any registered field has been edited.                                    |
| `data-touched`    | Any registered field has been touched.                                   |
| `data-submitting` | A registered `RdxFormState` provider reports the form is submitting.     |

## Accessibility

The form uses native submit/reset semantics (`novalidate`, so the directive owns validation
messaging). On submit it focuses the first invalid field in DOM order. Per-field error association
(`aria-describedby`) and the polite live region live on `rdxFieldError`, not on the form.
