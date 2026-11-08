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
