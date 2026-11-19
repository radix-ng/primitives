# Fieldset — Signup form

> One example from the [Fieldset](../components/fieldset.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

A larger form groups account details and submits values from fields inside the fieldset.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxNgControlField
} from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxInputDirective } from '@radix-ng/primitives/input';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'fieldset-signup-form-example',
    imports: [
        ReactiveFormsModule,
        RdxFieldsetRoot,
        RdxFieldsetLegend,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldDescription,
        RdxFieldError,
        RdxNgControlField,
        RdxInputDirective
    ],
    template: `
        <form class="w-96 space-y-5" [formGroup]="form" (ngSubmit)="submit()">
            <fieldset class="border-border space-y-4 rounded-md border p-4" [disabled]="submitting" rdxFieldsetRoot>
                <legend class="text-foreground px-1 text-sm font-semibold data-[disabled]:opacity-50" rdxFieldsetLegend>
                    Account details
                </legend>

                <div class="space-y-2" rdxFieldRoot required>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>First name</label>
                    <input
                        class="demo-input h-9 w-full px-3"
                        rdxInput
                        rdxNgControlField
                        autocomplete="given-name"
                        formControlName="firstName"
                    />
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>Used in your workspace profile.</p>
                    <p class="text-destructive text-sm" rdxFieldError>First name is required.</p>
                </div>

                <div class="space-y-2" rdxFieldRoot required>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>Email</label>
                    <input
                        class="demo-input h-9 w-full px-3"
                        rdxInput
                        rdxNgControlField
                        autocomplete="email"
                        formControlName="email"
                        type="email"
                    />
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

            <button class="demo-button demo-button-primary h-9 px-4" type="submit">
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

    protected submitting = false;
    protected submittedEmail = '';

    protected readonly form = this.formBuilder.nonNullable.group({
        firstName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        updates: [true]
    });

    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting = true;
        this.submittedEmail = this.form.controls.email.value;
        this.form.disable();
    }
}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
