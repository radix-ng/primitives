import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { RdxOtpFieldModule } from '../index';
import { otpFieldStyles } from './otp-field.styles';

type Verification = { code: string };

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-signal-forms-example',
    imports: [FormField, JsonPipe, RdxOtpFieldModule],
    template: `
        <div [class]="s.field">
            <label [class]="s.label" for="signal-code">One-time code</label>
            <div
                id="signal-code"
                [class]="s.root"
                [formField]="verificationForm.code"
                [length]="6"
                [autoComplete]="'one-time-code'"
                [inputMode]="'numeric'"
                rdxOtpFieldRoot
            >
                <input [class]="s.slot" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 2 of 6" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 3 of 6" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 4 of 6" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 5 of 6" rdxOtpFieldInput />
                <input [class]="s.slot" aria-label="Character 6 of 6" rdxOtpFieldInput />
            </div>
            <p class="text-muted-foreground text-sm">Signal Forms model: {{ model() | json }}</p>
        </div>
    `
})
export class OtpFieldSignalFormsExample {
    protected readonly s = otpFieldStyles;
    protected readonly model = signal<Verification>({ code: '' });
    protected readonly verificationForm = form(this.model, (path) => {
        required(path.code, { message: 'Enter a code.' });
    });
}
