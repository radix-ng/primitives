# Field

#### Groups a control with accessible label, description, error message, and field state.

Field is form-agnostic. It does not replace Angular Forms; pass validation state from Reactive
Forms, template-driven forms, or Signal Forms when using them.

```typescript
import { Component } from '@angular/core';
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldLabel } from './field.shared';

@Component({
  selector: 'field-default-example',
  imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
  template: `
    <div class="flex w-80 flex-col gap-2" rdxFieldRoot required>
      <label [class]="labelClass" rdxFieldLabel>Email</label>
      <input [class]="inputClass" rdxFieldControl type="email" placeholder="name@example.com" />
      <p [class]="descriptionClass" rdxFieldDescription>Used for account notifications.</p>
      <p [class]="errorClass" rdxFieldError>Enter a valid email address.</p>
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

## Examples

### Default

The root owns the relationships between the field parts.

```typescript
import { Component } from '@angular/core';
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldLabel } from './field.shared';

@Component({
  selector: 'field-default-example',
  imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
  template: `
    <div class="flex w-80 flex-col gap-2" rdxFieldRoot required>
      <label [class]="labelClass" rdxFieldLabel>Email</label>
      <input [class]="inputClass" rdxFieldControl type="email" placeholder="name@example.com" />
      <p [class]="descriptionClass" rdxFieldDescription>Used for account notifications.</p>
      <p [class]="errorClass" rdxFieldError>Enter a valid email address.</p>
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
import { Component } from '@angular/core';
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldInputInvalid, fieldLabel } from './field.shared';

@Component({
  selector: 'field-invalid-example',
  imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
  template: `
    <div class="flex w-80 flex-col gap-2" rdxFieldRoot invalid required dirty touched>
      <label [class]="labelClass" rdxFieldLabel>Workspace name</label>
      <input [class]="inputClass" rdxFieldControl value="" placeholder="acme" aria-errormessage="workspace-error" />
      <p [class]="descriptionClass" rdxFieldDescription>Use lowercase letters and hyphens.</p>
      <p id="workspace-error" [class]="errorClass" rdxFieldError>Workspace name is required.</p>
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
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldInputInvalid, fieldLabel, fieldSubmitButton } from './field.shared';

@Component({
  selector: 'field-reactive-forms-example',
  imports: [ReactiveFormsModule, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
  template: `
    <form class="flex w-80 flex-col gap-3" [formGroup]="form" (ngSubmit)="submit()">
      <div
        class="flex flex-col gap-2"
        [invalid]="email.invalid && (email.touched || submitted())"
        [dirty]="email.dirty"
        [touched]="email.touched"
        [disabled]="email.disabled"
        rdxFieldRoot
        required
      >
        <label [class]="labelClass" rdxFieldLabel>Email</label>
        <input [class]="inputClass" rdxFieldControl type="email" formControlName="email" />
        <p [class]="descriptionClass" rdxFieldDescription>Use the email connected to your account.</p>
        <p [class]="errorClass" rdxFieldError>
          @if (email.hasError('required')) {
            Email is required.
          } @else {
            Enter a valid email address.
          }
        </p>
      </div>

      <button [class]="buttonClass" type="submit">Submit</button>
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
import { Component, computed, signal } from '@angular/core';
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldCustomTrigger, fieldDescription, fieldError, fieldLabel } from './field.shared';

@Component({
  selector: 'field-custom-control-example',
  imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
  template: `
    <div class="flex w-80 flex-col gap-2" [filled]="selected()" [focused]="open()" rdxFieldRoot>
      <label [class]="labelClass" rdxFieldLabel>Plan</label>
      <button [class]="triggerClass" (click)="open.update((value) => !value)" type="button" rdxFieldControl>
        {{ selected() ? 'Pro' : 'Choose a plan' }}
      </button>
      <p [class]="descriptionClass" rdxFieldDescription>Custom controls can pass state into the field root.</p>
      <p [class]="errorClass" rdxFieldError>Choose a plan.</p>
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
