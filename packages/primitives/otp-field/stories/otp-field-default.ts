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
