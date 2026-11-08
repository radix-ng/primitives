import { ChangeDetectionStrategy, Component } from '@angular/core';
import { demoOtpField as otpFieldStyles } from '../../storybook/styles';
import { RdxOtpFieldModule } from '../index';

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
                aria-label="Grouped verification code"
                rdxOtpFieldRoot
            >
                <div class="flex gap-2">
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                </div>
                <div [class]="s.separator" rdxOtpFieldSeparator>—</div>
                <div class="flex gap-2">
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                    <input [class]="s.slot" rdxOtpFieldInput />
                </div>
            </div>
            <p [class]="s.description">The visual separator groups the eight characters into two blocks.</p>
        </div>
    `
})
export class OtpFieldGroupsExample {
    protected readonly s = otpFieldStyles;
}
