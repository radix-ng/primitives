import { ChangeDetectionStrategy, Component } from '@angular/core';
import { demoOtpField as otpFieldStyles } from '../../storybook/styles';
import { RdxOtpFieldModule } from '../index';

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
                aria-label="Uppercase verification code"
                rdxOtpFieldRoot
            >
                <input [class]="s.slot" placeholder="A" rdxOtpFieldInput />
                <input [class]="s.slot" placeholder="B" rdxOtpFieldInput />
                <input [class]="s.slot" placeholder="C" rdxOtpFieldInput />
                <input [class]="s.slot" placeholder="D" rdxOtpFieldInput />
                <input [class]="s.slot" placeholder="E" rdxOtpFieldInput />
                <input [class]="s.slot" placeholder="F" rdxOtpFieldInput />
            </div>
            <p [class]="s.description">Type lowercase or uppercase; the stored value is normalized to uppercase.</p>
        </div>
    `
})
export class OtpFieldNormalizeExample {
    protected readonly s = otpFieldStyles;
    protected readonly uppercase = (value: string): string => value.toUpperCase();
}
