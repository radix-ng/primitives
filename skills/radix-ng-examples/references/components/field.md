# Field

#### Groups a control with accessible label, description, error message, and field state.

Field is form-agnostic. It does not replace Angular Forms; pass validation state from Reactive
Forms, template-driven forms, or Signal Forms when using them.

```typescript
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldLabel } from './field.shared';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-default-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot required>
            <label rdxFieldLabel [class]="labelClass">Email</label>
            <input rdxFieldControl type="email" placeholder="name@example.com" [class]="inputClass" />
            <p rdxFieldDescription [class]="descriptionClass">Used for account notifications.</p>
            <p rdxFieldError [class]="errorClass">Enter a valid email address.</p>
        </div>
    `
})
export class FieldDefaultExample {
    protected readonly inputClass =
        'border-border bg-background text-foreground placeholder:text-muted-foreground h-9 w-full rounded-md border px-3 text-sm outline-none';
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
}
```

## Features

- ✅ Wires labels to controls with `for` and generated control ids.
- ✅ Wires descriptions and errors with `aria-describedby`.
- ✅ Exposes state via `data-invalid`, `data-disabled`, `data-required`, `data-dirty`, `data-touched`, `data-filled`, and `data-focused`.
- ✅ Works with native controls and custom controls.
- ✅ Leaves validation and form submission to Angular Forms.

## Import

```typescript
import {
    RdxFieldRoot,
    RdxFieldLabel,
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError
} from '@radix-ng/primitives/field';
```

## Anatomy

```html
<div rdxFieldRoot>
    <label rdxFieldLabel>Label</label>
    <input rdxFieldControl />
    <p rdxFieldDescription>Description</p>
    <p rdxFieldError>Error</p>
</div>
```

For a checkbox or radio group where each control needs its own label and description, wrap each one in a
`rdxFieldItem`. The item scopes the label / description / control association to its control while
reflecting the field's validation state; its `disabled` is OR'd with the root's.

```html
<div rdxFieldRoot>
    <div rdxFieldItem>
        <label rdxFieldLabel>Option A</label>
        <input rdxFieldControl type="radio" />
        <p rdxFieldDescription>Description A</p>
    </div>
    <div rdxFieldItem>
        <label rdxFieldLabel>Option B</label>
        <input rdxFieldControl type="radio" />
    </div>
    <p rdxFieldError>Error</p>
</div>
```

## Examples

### Default

The root owns the relationships between the field parts.

```typescript
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldLabel } from './field.shared';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-default-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot required>
            <label rdxFieldLabel [class]="labelClass">Email</label>
            <input rdxFieldControl type="email" placeholder="name@example.com" [class]="inputClass" />
            <p rdxFieldDescription [class]="descriptionClass">Used for account notifications.</p>
            <p rdxFieldError [class]="errorClass">Enter a valid email address.</p>
        </div>
    `
})
export class FieldDefaultExample {
    protected readonly inputClass =
        'border-border bg-background text-foreground placeholder:text-muted-foreground h-9 w-full rounded-md border px-3 text-sm outline-none';
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
}
```

### Invalid

Pass invalid, dirty, and touched state from your form model.

```typescript
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldInputInvalid, fieldLabel } from './field.shared';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-invalid-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot invalid required dirty touched>
            <label rdxFieldLabel [class]="labelClass">Workspace name</label>
            <input
                rdxFieldControl
                value=""
                placeholder="acme"
                aria-errormessage="workspace-error"
                [class]="inputClass"
            />
            <p rdxFieldDescription [class]="descriptionClass">Use lowercase letters and hyphens.</p>
            <p id="workspace-error" rdxFieldError [class]="errorClass">Workspace name is required.</p>
        </div>
    `
})
export class FieldInvalidExample {
    protected readonly inputClass = fieldInputInvalid;
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
}
```

### Reactive Forms

Angular Forms remains responsible for validation. Field reflects the resulting state and ARIA
relationships.

```typescript
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldInputInvalid, fieldLabel, fieldSubmitButton } from './field.shared';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-reactive-forms-example',
    imports: [ReactiveFormsModule, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <form class="flex w-80 flex-col gap-3" [formGroup]="form" (ngSubmit)="submit()">
            <div
                class="flex flex-col gap-2"
                rdxFieldRoot
                required
                [invalid]="email.invalid && (email.touched || submitted())"
                [dirty]="email.dirty"
                [touched]="email.touched"
                [disabled]="email.disabled"
            >
                <label rdxFieldLabel [class]="labelClass">Email</label>
                <input rdxFieldControl type="email" formControlName="email" [class]="inputClass" />
                <p rdxFieldDescription [class]="descriptionClass">Use the email connected to your account.</p>
                <p rdxFieldError [class]="errorClass">
                    @if (email.hasError('required')) {
                        Email is required.
                    } @else {
                        Enter a valid email address.
                    }
                </p>
            </div>

            <button type="submit" [class]="buttonClass">Submit</button>
        </form>
    `
})
export class FieldReactiveFormsExample {
    protected readonly inputClass = fieldInputInvalid;
    protected readonly buttonClass = fieldSubmitButton;
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;

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

### Custom Control

For custom controls, pass `filled` and `focused` state to the root when the native events are not
enough.

```typescript
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldCustomTrigger, fieldDescription, fieldError, fieldLabel } from './field.shared';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-custom-control-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot [filled]="selected()" [focused]="open()">
            <label rdxFieldLabel [class]="labelClass">Plan</label>
            <button type="button" rdxFieldControl [class]="triggerClass" (click)="open.update((value) => !value)">
                {{ selected() ? 'Pro' : 'Choose a plan' }}
            </button>
            <p rdxFieldDescription [class]="descriptionClass">Custom controls can pass state into the field root.</p>
            <p rdxFieldError [class]="errorClass">Choose a plan.</p>
        </div>
    `
})
export class FieldCustomControlExample {
    readonly open = signal(false);
    readonly selected = computed(() => this.open());

    protected readonly triggerClass = fieldCustomTrigger;
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
}
```

## API Reference
