import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxOtpFieldModule } from '../index';
import { otpFieldStyles } from './otp-field.styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-groups-example',
    imports: [RdxOtpFieldModule],
    template: `
        <div [class]="s.field">
            <label [class]="s.label" for="grouped-code">Backup code</label>
            <div
                id="grouped-code"
                [class]="s.root"
                [length]="8"
                [inputMode]="'text'"
                [validationType]="'alphanumeric'"
                rdxOtpFieldRoot
            >
                <div class="flex gap-2">
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 2 of 8" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 3 of 8" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 4 of 8" rdxOtpFieldInput />
                </div>
                <div [class]="s.separator" aria-hidden="true" rdxOtpFieldSeparator>—</div>
                <div class="flex gap-2">
                    <input [class]="s.slot" aria-label="Character 5 of 8" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 6 of 8" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 7 of 8" rdxOtpFieldInput />
                    <input [class]="s.slot" aria-label="Character 8 of 8" rdxOtpFieldInput />
                </div>
            </div>
            <p [class]="s.description">The visual separator groups the eight characters into two blocks.</p>
        </div>
    `
})
export class OtpFieldGroupsExample {
    protected readonly s = otpFieldStyles;
}
