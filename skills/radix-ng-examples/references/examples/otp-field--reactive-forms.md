# OTP Field — Reactive Forms

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

The root works with `formControlName` and forwards required validity to the form-associated hidden control. When wrapped in `rdxFieldRoot`, it registers the first slot as the label target and inherits the Field's disabled and required state.

```typescript
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdxOtpFieldInput, RdxOtpFieldRoot } from '@radix-ng/primitives/otp-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-reactive-forms-example',
    imports: [JsonPipe, ReactiveFormsModule, RdxOtpFieldRoot, RdxOtpFieldInput],
    template: `
        <form class="grid max-w-md gap-5" [formGroup]="verification" (ngSubmit)="onSubmit()">
            <div class="grid gap-1.5">
                <label class="demo-label mb-2 block" for="form-code">Verification code</label>
                <div
                    class="flex items-center gap-2"
                    id="form-code"
                    [length]="6"
                    [autoComplete]="'one-time-code'"
                    [inputMode]="'numeric'"
                    formControlName="code"
                    name="code"
                    required
                    aria-label="Verification code"
                    rdxOtpFieldRoot
                >
                    <input
                        class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                        rdxOtpFieldInput
                    />
                    <input
                        class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                        rdxOtpFieldInput
                    />
                    <input
                        class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                        rdxOtpFieldInput
                    />
                    <input
                        class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                        rdxOtpFieldInput
                    />
                    <input
                        class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                        rdxOtpFieldInput
                    />
                    <input
                        class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                        rdxOtpFieldInput
                    />
                </div>
                <p class="text-muted-foreground mt-2 text-sm">Reactive Forms owns the value and required validation.</p>
            </div>

            <button class="demo-button demo-button-primary px-4 py-2" type="submit">Verify</button>
            <p class="text-muted-foreground text-sm">Form value: {{ verification.value | json }}</p>
            @if (submitted) {
                <p class="text-foreground text-sm">Submitted code: {{ submitted }}</p>
            }
        </form>
    `
})
export class OtpFieldReactiveFormsExample {
    protected readonly verification = new FormGroup({
        code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })
    });

    protected submitted = '';

    protected onSubmit(): void {
        this.submitted = this.verification.controls.code.value;
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
