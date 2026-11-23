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

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
