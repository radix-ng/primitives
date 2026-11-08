# OTP Field — Placeholders

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Set the native `placeholder` on each slot to show a per-character hint.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { demoOtpField as otpFieldStyles } from '../../storybook/styles';
import { RdxOtpFieldModule } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-placeholder-example',
    imports: [RdxOtpFieldModule],
    template: `
        <div [class]="s.field">
            <label id="placeholder-code-label" [class]="s.label" for="placeholder-code">Invitation code</label>
            <div
                id="placeholder-code"
                [class]="s.root"
                [length]="6"
                aria-labelledby="placeholder-code-label"
                rdxOtpFieldRoot
            >
                <input [class]="s.slot" placeholder="•" rdxOtpFieldInput />
                <input [class]="s.slot" placeholder="•" rdxOtpFieldInput />
                <input [class]="s.slot" placeholder="•" rdxOtpFieldInput />
                <input [class]="s.slot" placeholder="•" rdxOtpFieldInput />
                <input [class]="s.slot" placeholder="•" rdxOtpFieldInput />
                <input [class]="s.slot" placeholder="•" rdxOtpFieldInput />
            </div>
            <p [class]="s.description">Each empty slot shows its own placeholder.</p>
        </div>
    `
})
export class OtpFieldPlaceholderExample {
    protected readonly s = otpFieldStyles;
}
```
