import { ChangeDetectionStrategy, Component } from '@angular/core';
import { demoOtpField as otpFieldStyles } from '../../storybook/styles';
import { RdxOtpFieldModule } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-mask-example',
    imports: [RdxOtpFieldModule],
    template: `
        <div [class]="s.field">
            <label [class]="s.label" for="masked-code">Private access code</label>
            <div
                id="masked-code"
                [class]="s.root"
                [length]="6"
                [mask]="true"
                [autoComplete]="'one-time-code'"
                [inputMode]="'numeric'"
                aria-label="Masked verification code"
                rdxOtpFieldRoot
            >
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" rdxOtpFieldInput />
            </div>
            <p [class]="s.description">
                Masking obscures the entered characters while keeping text input and autofill available.
            </p>
        </div>
    `
})
export class OtpFieldMaskExample {
    protected readonly s = otpFieldStyles;
}
