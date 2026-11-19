# OTP Field — Signal Forms

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Bind `[formField]` to the root to connect the multi-slot control to Angular Signal Forms. `rdxSignalField` is only needed when an enclosing `rdxFieldRoot` should receive field state.

```typescript
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { RdxOtpFieldInput, RdxOtpFieldRoot } from '@radix-ng/primitives/otp-field';

type Verification = { code: string };

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-signal-forms-example',
    imports: [FormField, JsonPipe, RdxOtpFieldRoot, RdxOtpFieldInput],
    template: `
        <div class="grid gap-1.5">
            <label class="demo-label mb-2 block" for="signal-code">One-time code</label>
            <div
                class="flex items-center gap-2"
                id="signal-code"
                [formField]="verificationForm.code"
                [length]="6"
                [autoComplete]="'one-time-code'"
                [inputMode]="'numeric'"
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
            <p class="text-muted-foreground text-sm">Signal Forms model: {{ model() | json }}</p>
        </div>
    `
})
export class OtpFieldSignalFormsExample {
    protected readonly model = signal<Verification>({ code: '' });
    protected readonly verificationForm = form(this.model, (path) => {
        required(path.code, { message: 'Enter a code.' });
    });
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
