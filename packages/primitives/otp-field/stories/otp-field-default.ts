import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxOtpFieldModule } from '../index';
import { otpFieldStyles } from './otp-field.styles';

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
                rdxOtpFieldRoot
            >
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 2 of 6" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 3 of 6" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 4 of 6" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 5 of 6" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 6 of 6" rdxOtpFieldInput />
            </div>
            <p [class]="s.description">Enter the six-digit code sent to your device.</p>
        </div>
    `
})
export class OtpFieldDefaultExample {
    protected readonly s = otpFieldStyles;
}
