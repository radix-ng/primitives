# OTP Field — Uppercase normalization

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.2.1` — if the installed version differs, verify the API against the installed package.

`normalizeValue` can transform accepted text. Keep normalization idempotent so repeated updates do not change an already normalized value.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxOtpFieldModule } from '../index';
import { otpFieldStyles } from './otp-field.styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-normalize-example',
    imports: [RdxOtpFieldModule],
    template: `
        <div [class]="s.field">
            <label [class]="s.label" for="uppercase-code">Alphabetic code</label>
            <div
                id="uppercase-code"
                [class]="s.root"
                [length]="6"
                [normalizeValue]="uppercase"
                [validationType]="'alpha'"
                rdxOtpFieldRoot
            >
                <input [class]="s.slot" placeholder="A" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 2 of 6" placeholder="B" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 3 of 6" placeholder="C" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 4 of 6" placeholder="D" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 5 of 6" placeholder="E" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 6 of 6" placeholder="F" rdxOtpFieldInput />
            </div>
            <p [class]="s.description">Type lowercase or uppercase; the stored value is normalized to uppercase.</p>
        </div>
    `
})
export class OtpFieldNormalizeExample {
    protected readonly s = otpFieldStyles;
    protected readonly uppercase = (value: string): string => value.toUpperCase();
}
```
