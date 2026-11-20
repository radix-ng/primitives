# Input — Signup Form

> One example from the [Input](../components/input.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Combines multiple inputs, Field state, a checkbox, and a submit button in a larger form.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import {
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxNgControlField
} from '@radix-ng/primitives/field';
import { RdxInputDirective } from '@radix-ng/primitives/input';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'input-signup-form-example',
    imports: [
        ReactiveFormsModule,
        LucideCheck,
        RdxButtonDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        RdxCheckboxInputDirective,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldDescription,
        RdxFieldError,
        RdxNgControlField,
        RdxInputDirective
    ],
    template: `
        <form class="flex w-[24rem] flex-col gap-5" [formGroup]="form" (ngSubmit)="submit()">
            <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-2" rdxFieldRoot required>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>First name</label>
                    <input
                        class="demo-input h-9 w-full px-3"
                        rdxInput
                        rdxNgControlField
                        autocomplete="given-name"
                        formControlName="firstName"
                    />
                    <p class="text-destructive text-sm" rdxFieldError>Enter your first name.</p>
                </div>

                <div class="flex flex-col gap-2" rdxFieldRoot required>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>Last name</label>
                    <input
                        class="demo-input h-9 w-full px-3"
                        rdxInput
                        rdxNgControlField
                        autocomplete="family-name"
                        formControlName="lastName"
                    />
                    <p class="text-destructive text-sm" rdxFieldError>Enter your last name.</p>
                </div>
            </div>

            <div class="flex flex-col gap-2" rdxFieldRoot required>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Email</label>
                <input
                    class="demo-input h-9 w-full px-3"
                    rdxInput
                    rdxNgControlField
                    type="email"
                    autocomplete="email"
                    placeholder="name@example.com"
                    formControlName="email"
                />
                <p class="text-muted-foreground text-sm" rdxFieldDescription>
                    Used for product updates and account recovery.
                </p>
                <p class="text-destructive text-sm" rdxFieldError>Enter a valid email address.</p>
            </div>

            <div class="flex flex-col gap-2" rdxFieldRoot required>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Password</label>
                <input
                    class="demo-input h-9 w-full px-3"
                    rdxInput
                    rdxNgControlField
                    type="password"
                    autocomplete="new-password"
                    formControlName="password"
                />
                <p class="text-muted-foreground text-sm" rdxFieldDescription>Use at least 8 characters.</p>
                <p class="text-destructive text-sm" rdxFieldError>Password must be at least 8 characters.</p>
            </div>

            <div class="flex items-start gap-3">
                <div rdxCheckboxRoot required formControlName="terms">
                    <button
                        class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        id="signup-terms"
                        type="button"
                        rdxCheckboxButton
                    >
                        <svg
                            class="text-primary flex items-center"
                            *rdxCheckboxIndicatorPresence
                            rdxCheckboxIndicator
                            size="16"
                            lucideCheck
                        />
                    </button>
                    <input rdxCheckboxInput />
                </div>

                <label class="text-foreground text-sm leading-6" for="signup-terms">
                    I agree to receive onboarding emails and accept the workspace terms.
                </label>
            </div>

            <button class="demo-button demo-button-primary h-9 w-full px-4" rdxButton type="submit">
                Create workspace
            </button>
        </form>
    `
})
export class InputSignupFormExample {
    readonly form = new FormGroup({
        firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
        password: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(8)]
        }),
        terms: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] })
    });

    submit(): void {
        this.form.markAllAsTouched();
    }
}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`. Copy the component from **Show code** and any shared files below,
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
