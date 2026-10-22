import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxOtpFieldModule } from '../index';
import { otpFieldStyles } from './otp-field.styles';

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
                rdxOtpFieldRoot
            >
                <input [class]="s.slot" type="text" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 2 of 6" type="text" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 3 of 6" type="text" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 4 of 6" type="text" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 5 of 6" type="text" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 6 of 6" type="text" rdxOtpFieldInput />
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
