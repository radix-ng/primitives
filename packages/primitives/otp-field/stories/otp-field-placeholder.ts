import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxOtpFieldModule } from '../index';
import { otpFieldStyles } from './otp-field.styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-placeholder-example',
    imports: [RdxOtpFieldModule],
    template: `
        <div [class]="s.field">
            <label [class]="s.label" for="placeholder-code">Invitation code</label>
            <div id="placeholder-code" [class]="s.root" [length]="6" rdxOtpFieldRoot>
                <input [class]="s.slot" placeholder="•" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 2 of 6" placeholder="•" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 3 of 6" placeholder="•" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 4 of 6" placeholder="•" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 5 of 6" placeholder="•" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 6 of 6" placeholder="•" rdxOtpFieldInput />
            </div>
            <p [class]="s.description">Each empty slot shows its own placeholder.</p>
        </div>
    `
})
export class OtpFieldPlaceholderExample {
    protected readonly s = otpFieldStyles;
}
