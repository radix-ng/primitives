# OTP Field — Basic numeric code

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

The first slot uses one-time-code autocomplete and a numeric input mode for mobile keyboards.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { demoOtpField as otpFieldStyles } from '../../storybook/styles';
import { RdxOtpFieldModule } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-default-example',
    imports: [RdxOtpFieldModule],
    template: `
        <div [class]="s.field">
            <label [class]="s.label" for="verification-code">Verification code</label>
            <div
                id="verification-code"
                [class]="s.root"
                [length]="6"
                [autoComplete]="'one-time-code'"
                [inputMode]="'numeric'"
                name="verificationCode"
                aria-label="Verification code"
                rdxOtpFieldRoot
            >
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" rdxOtpFieldInput />
            </div>
            <p [class]="s.description">Enter the six-digit code sent to your device.</p>
        </div>
    `
})
export class OtpFieldDefaultExample {
    protected readonly s = otpFieldStyles;
}
```
