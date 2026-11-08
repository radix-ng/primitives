# OTP Field — Character validation

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

`validationType` accepts `numeric` (the default), `alpha`, `alphanumeric`, or `none`. The first three modes accept ASCII characters only: digits `0–9`, letters `A–Z`, and their combination. Use `none` for other alphabets; `normalizeValue` can still transform text before it is stored.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { demoOtpField as otpFieldStyles } from '../../storybook/styles';
import { RdxOtpFieldModule } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-validation-example',
    imports: [RdxOtpFieldModule],
    template: `
        <div class="grid gap-6">
            <div [class]="s.field">
                <label id="letters-only-label" [class]="s.label" for="letters-only">Letters only</label>
                <div
                    id="letters-only"
                    [class]="s.root"
                    [length]="6"
                    [validationType]="'alpha'"
                    aria-labelledby="letters-only-label"
                    rdxOtpFieldRoot
                >
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                </div>
            </div>

            <div [class]="s.field">
                <label [class]="s.label" for="letters-and-digits">Letters and digits</label>
                <div
                    id="letters-and-digits"
                    [class]="s.root"
                    [length]="6"
                    [validationType]="'alphanumeric'"
                    aria-label="Letters and numbers code"
                    rdxOtpFieldRoot
                >
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                </div>
            </div>
        </div>
    `
})
export class OtpFieldValidationExample {
    protected readonly s = otpFieldStyles;
}
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
