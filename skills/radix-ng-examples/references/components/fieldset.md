# Fieldset

#### Groups related form controls with a legend and shared disabled state.

```html
<fieldset class="border-border w-80 space-y-4 rounded-md border p-4" rdxFieldsetRoot>
    <legend class="text-foreground px-1 text-sm font-semibold" rdxFieldsetLegend>Shipping address</legend>

    <div class="space-y-2" rdxFieldRoot required>
        <label class="text-foreground text-sm font-medium" rdxFieldLabel>Street address</label>
        <input [class]="inputClass" rdxInput autocomplete="shipping street-address" />
        <p class="text-muted-foreground text-sm" rdxFieldDescription>Used to calculate delivery options.</p>
        <p class="text-destructive text-sm" rdxFieldError>Street address is required.</p>
    </div>

    <div class="space-y-2" rdxFieldRoot>
        <label class="text-foreground text-sm font-medium" rdxFieldLabel>Apartment</label>
        <input [class]="inputClass" rdxInput autocomplete="shipping address-line2" />
    </div>
</fieldset>
```

## Features

- ✅ Uses native `fieldset` and `legend` semantics.
- ✅ Disables all form controls in the group with one prop.
- ✅ Exposes disabled state with `data-disabled`.
- ✅ Composes with Field and Input.

## Import

```typescript
import { RdxFieldsetRoot, RdxFieldsetLegend } from '@radix-ng/primitives/fieldset';
```

## Anatomy

```html
<fieldset rdxFieldsetRoot>
  <legend rdxFieldsetLegend>Shipping address</legend>
  <!-- fields -->
</fieldset>
```

## Examples

### Default

A fieldset groups related Field and Input primitives under one native legend.

```html
<fieldset class="border-border w-80 space-y-4 rounded-md border p-4" rdxFieldsetRoot>
    <legend class="text-foreground px-1 text-sm font-semibold" rdxFieldsetLegend>Shipping address</legend>

    <div class="space-y-2" rdxFieldRoot required>
        <label class="text-foreground text-sm font-medium" rdxFieldLabel>Street address</label>
        <input [class]="inputClass" rdxInput autocomplete="shipping street-address" />
        <p class="text-muted-foreground text-sm" rdxFieldDescription>Used to calculate delivery options.</p>
        <p class="text-destructive text-sm" rdxFieldError>Street address is required.</p>
    </div>

    <div class="space-y-2" rdxFieldRoot>
        <label class="text-foreground text-sm font-medium" rdxFieldLabel>Apartment</label>
        <input [class]="inputClass" rdxInput autocomplete="shipping address-line2" />
    </div>
</fieldset>
```

### Disabled

Disabled state is applied to the native fieldset and exposed to the legend for styling.

```html
<fieldset class="border-border w-80 space-y-4 rounded-md border p-4" rdxFieldsetRoot disabled>
    <legend class="text-foreground px-1 text-sm font-semibold data-[disabled]:opacity-50" rdxFieldsetLegend>
        Billing address
    </legend>

    <div class="space-y-2" rdxFieldRoot disabled>
        <label class="text-foreground text-sm font-medium data-[disabled]:opacity-50" rdxFieldLabel>
            Company
        </label>
        <input [class]="inputClass" rdxInput defaultValue="Acme Inc." />
    </div>
</fieldset>
```

### Signup form

A larger form groups account details and submits values from fields inside the fieldset.

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxInputDirective } from '@radix-ng/primitives/input';
import { cn, demoButton, demoInput } from '../../storybook/styles';

@Component({
    selector: 'fieldset-signup-form-example',
    imports: [
        ReactiveFormsModule,
        RdxFieldsetRoot,
        RdxFieldsetLegend,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldDescription,
        RdxFieldError,
        RdxInputDirective
    ],
    template: `
        <form class="w-96 space-y-5" [formGroup]="form" (ngSubmit)="submit()">
            <fieldset class="border-border space-y-4 rounded-md border p-4" [disabled]="submitting" rdxFieldsetRoot>
                <legend class="text-foreground px-1 text-sm font-semibold data-[disabled]:opacity-50" rdxFieldsetLegend>
                    Account details
                </legend>

                <div class="space-y-2" [invalid]="isInvalid('firstName')" [disabled]="submitting" rdxFieldRoot required>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>First name</label>
                    <input [class]="inputClass" rdxInput autocomplete="given-name" formControlName="firstName" />
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>Used in your workspace profile.</p>
                    <p class="text-destructive text-sm" rdxFieldError>First name is required.</p>
                </div>

                <div class="space-y-2" [invalid]="isInvalid('email')" [disabled]="submitting" rdxFieldRoot required>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>Email</label>
                    <input [class]="inputClass" rdxInput autocomplete="email" formControlName="email" type="email" />
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>
                        We'll send the invite confirmation here.
                    </p>
                    <p class="text-destructive text-sm" rdxFieldError>Enter a valid email address.</p>
                </div>

                <div class="flex items-start gap-3 pt-1">
                    <input
                        class="border-border accent-primary mt-1 size-4 rounded disabled:opacity-50"
                        id="product-updates"
                        formControlName="updates"
                        type="checkbox"
                    />
                    <div class="space-y-1">
                        <label class="text-foreground text-sm font-medium" for="product-updates">Product updates</label>
                        <p class="text-muted-foreground text-sm">
                            Receive occasional release notes and migration tips.
                        </p>
                    </div>
                </div>
            </fieldset>

            <button [class]="cn(button.base, button.primary, button.size.md)" type="submit">
                {{ submitting ? 'Submitting...' : 'Create account' }}
            </button>

            @if (submittedEmail) {
                <p class="text-muted-foreground text-sm">Submitted {{ submittedEmail }}</p>
            }
        </form>
    `
})
export class FieldsetSignupFormExample {
    private readonly formBuilder = inject(FormBuilder);

    protected readonly cn = cn;
    protected readonly button = demoButton;
    protected readonly inputClass = demoInput;

    protected submitting = false;
    protected submittedEmail = '';

    protected readonly form = this.formBuilder.nonNullable.group({
        firstName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        updates: [true]
    });

    protected isInvalid(controlName: 'firstName' | 'email'): boolean {
        const control = this.form.controls[controlName];
        return control.invalid && (control.touched || control.dirty);
    }

    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting = true;
        this.submittedEmail = this.form.controls.email.value;
    }
}
```

## API Reference

### Root

`RdxFieldsetRoot`

### Legend

`RdxFieldsetLegend`

Reads disabled state from the root context and exposes it via `data-disabled`.

## Accessibility

Use Fieldset when a label applies to a group of related controls. The native `legend` gives the
group an accessible name, and the native `disabled` attribute disables descendant form controls.
