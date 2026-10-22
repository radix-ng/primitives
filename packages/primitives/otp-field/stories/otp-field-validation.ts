import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxOtpFieldModule } from '../index';
import { otpFieldStyles } from './otp-field.styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-validation-example',
    imports: [RdxOtpFieldModule],
    template: `
        <div class="grid gap-6">
            <div [class]="s.field">
                <label [class]="s.label" for="letters-only">Letters only</label>
                <div id="letters-only" [class]="s.root" [length]="6" [validationType]="'alpha'" rdxOtpFieldRoot>
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 2 of 6" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 3 of 6" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 4 of 6" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 5 of 6" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 6 of 6" rdxOtpFieldInput />
                </div>
            </div>

            <div [class]="s.field">
                <label [class]="s.label" for="letters-and-digits">Letters and digits</label>
                <div
                    id="letters-and-digits"
                    [class]="s.root"
                    [length]="6"
                    [validationType]="'alphanumeric'"
                    rdxOtpFieldRoot
                >
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 2 of 6" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 3 of 6" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 4 of 6" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 5 of 6" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 6 of 6" rdxOtpFieldInput />
                </div>
            </div>
        </div>
    `
})
export class OtpFieldValidationExample {
    protected readonly s = otpFieldStyles;
}
