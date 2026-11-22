# OTP Field — Character validation

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

`validationType` accepts `numeric` (the default), `alpha`, `alphanumeric`, or `none`. The first three modes accept ASCII characters only: digits `0–9`, letters `A–Z`, and their combination. Use `none` for other alphabets; `normalizeValue` can still transform text before it is stored.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxOtpFieldInput, RdxOtpFieldRoot } from '@radix-ng/primitives/otp-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-validation-example',
    imports: [RdxOtpFieldRoot, RdxOtpFieldInput],
    template: `
        <div class="grid gap-6">
            <div class="grid gap-1.5">
                <label class="demo-label mb-2 block" id="letters-only-label" for="letters-only">Letters only</label>
                <div
                    class="flex items-center gap-2"
                    id="letters-only"
                    [length]="6"
                    [validationType]="'alpha'"
                    aria-labelledby="letters-only-label"
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
            </div>

            <div class="grid gap-1.5">
                <label class="demo-label mb-2 block" for="letters-and-digits">Letters and digits</label>
                <div
                    class="flex items-center gap-2"
                    id="letters-and-digits"
                    [length]="6"
                    [validationType]="'alphanumeric'"
                    aria-label="Letters and numbers code"
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
            </div>
        </div>
    `
})
export class OtpFieldValidationExample {}
```

For example, a field that accepts Cyrillic characters can use `[validationType]="'none'"` and normalize to NFC:

```html
<div [length]="6" [validationType]="'none'" [normalizeValue]="normalizeNfc" rdxOtpFieldRoot>
  <input rdxOtpFieldInput />
  <input rdxOtpFieldInput />
  <input rdxOtpFieldInput />
  <input rdxOtpFieldInput />
  <input rdxOtpFieldInput />
  <input rdxOtpFieldInput />
</div>
```

```ts
readonly normalizeNfc = (value: string) => value.normalize('NFC');
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
