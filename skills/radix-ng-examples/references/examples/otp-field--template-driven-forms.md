# OTP Field — Template-driven forms

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.2.1` — if the installed version differs, verify the API against the installed package.

Use `[(ngModel)]` on the root to bind the complete string value.

```typescript
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxOtpFieldModule } from '../index';
import { otpFieldStyles } from './otp-field.styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-ngmodel-example',
    imports: [FormsModule, JsonPipe, RdxOtpFieldModule],
    template: `
        <div [class]="s.field">
            <label [class]="s.label" for="template-code">Recovery code</label>
            <div
                id="template-code"
                [(ngModel)]="code"
                [class]="s.root"
                [length]="6"
                [autoComplete]="'one-time-code'"
                [inputMode]="'numeric'"
                name="recoveryCode"
                rdxOtpFieldRoot
            >
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 2 of 6" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 3 of 6" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 4 of 6" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 5 of 6" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 6 of 6" rdxOtpFieldInput />
            </div>
            <p class="text-muted-foreground text-sm">ngModel value: {{ code | json }}</p>
        </div>
    `
})
export class OtpFieldNgModelExample {
    protected readonly s = otpFieldStyles;
    protected code = '';
}
```
