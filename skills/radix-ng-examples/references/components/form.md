# Form

#### The top of the forms layer cake: aggregates fields, maps server errors by name, and intercepts submit and reset.

Form rides the native `<form>` element. It owns no values and runs no validation — Angular form
systems (or Field inputs) stay the source of validity. It maps external/server errors onto fields by
`name`, clears them as the user edits, serializes values on submit, focuses the first invalid field,
and resets field interaction state on native reset.

```typescript
import { Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormErrors, RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formError, formField, formInput, formLabel, formSubmit } from './form.shared';

/**
 * Server-error mapping with clear-on-edit. The submit handler simulates a backend that rejects a
 * taken email; the returned error maps onto the matching field by `name`. Editing the field clears
 * its error, and binding `(onClearErrors)` back into `errors` keeps the controlled map in sync.
 */
@Component({
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
- ✅ Signal Forms-ready: an `RdxFormState` provider seam lets a future `[rdxSignalForm]` adapter own validity, submitting, and server errors.

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
import { Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormErrors, RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formError, formField, formInput, formLabel, formSubmit } from './form.shared';

/**
 * Server-error mapping with clear-on-edit. The submit handler simulates a backend that rejects a
 * taken email; the returned error maps onto the matching field by `name`. Editing the field clears
 * its error, and binding `(onClearErrors)` back into `errors` keeps the controlled map in sync.
 */
@Component({
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
import { Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormErrors, RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formError, formField, formInput, formLabel, formReset, formSubmit } from './form.shared';

/**
 * Native `reset` clears external errors and every field's interaction state (touched/dirty/focused),
 * and re-syncs `filled` to the reverted values — no manual wiring. Submit a wrong code to surface a
 * server error, then press Reset; submit `1234` to pass.
 */
@Component({
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

Reactive Forms owns validity; Form adds the aggregate attributes and submit handling on the same
`<form>`. `(ngSubmit)` is the source of truth — Form never stops propagation.

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '../index';
import { formError, formField, formInput, formLabel, formSubmit } from './form.shared';

/**
 * Reactive Forms owns validity; `RdxFormRoot` adds the aggregate `data-*` attributes and submit/reset
 * handling on the same `<form>`. Use `(ngSubmit)` as the source of truth here — `RdxFormRoot` never
 * stops propagation, so both fire — and map each `FormControl`'s validity into the Field's `invalid`.
 */
@Component({
    selector: 'form-reactive-forms-example',
    imports: [ReactiveFormsModule, RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldError],
    template: `
        <form class="flex w-80 flex-col gap-4" [formGroup]="form" (ngSubmit)="submit()" rdxFormRoot>
            <div
                [class]="field"
                [invalid]="email.invalid && (email.touched || submitted())"
                [touched]="email.touched"
                [dirty]="email.dirty"
                name="email"
                rdxFieldRoot
                required
            >
                <label [class]="label" rdxFieldLabel>Email</label>
                <input [class]="input" type="email" formControlName="email" rdxFieldControl />
                <p [class]="error" rdxFieldError>
                    @if (email.hasError('required')) {
                        Email is required.
                    } @else {
                        Enter a valid email address.
                    }
                </p>
            </div>

            <button [class]="submitButton" type="submit">Submit</button>
        </form>
    `
})
export class FormReactiveFormsExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly error = formError;
    protected readonly submitButton = formSubmit;

    private readonly formBuilder = inject(FormBuilder);

    readonly submitted = signal(false);
    readonly form = this.formBuilder.group({
        email: this.formBuilder.control('', [Validators.required, Validators.email])
    });

    get email() {
        return this.form.controls.email;
    }

    submit(): void {
        this.submitted.set(true);
        this.form.markAllAsTouched();
    }
}
```

### Native controls

No `@angular/forms` at all — a valid submit serializes the form's `FormData` into a plain values object
(repeated names collapse into arrays).

```typescript
import { Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formField, formInput, formLabel, formSubmit } from './form.shared';

/**
 * No `@angular/forms` at all — just native controls. On a valid submit the Form serializes the form's
 * `FormData` into a plain values object (repeated `name`s collapse into arrays).
 */
@Component({
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
