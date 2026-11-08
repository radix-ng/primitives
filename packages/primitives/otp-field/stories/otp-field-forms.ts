import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { demoOtpField as otpFieldStyles } from '../../storybook/styles';
import { RdxOtpFieldModule } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-reactive-forms-example',
    imports: [JsonPipe, ReactiveFormsModule, RdxOtpFieldModule],
    template: `
        <form [class]="s.form" [formGroup]="verification" (ngSubmit)="onSubmit()">
            <div [class]="s.field">
                <label [class]="s.label" for="form-code">Verification code</label>
                <div
                    id="form-code"
                    [class]="s.root"
                    [length]="6"
                    [autoComplete]="'one-time-code'"
                    [inputMode]="'numeric'"
                    formControlName="code"
                    name="code"
                    required
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
                <p [class]="s.description">Reactive Forms owns the value and required validation.</p>
            </div>

            <button [class]="s.submit" type="submit">Verify</button>
            <p class="text-muted-foreground text-sm">Form value: {{ verification.value | json }}</p>
            @if (submitted) {
                <p class="text-foreground text-sm">Submitted code: {{ submitted }}</p>
            }
        </form>
    `
})
export class OtpFieldReactiveFormsExample {
    protected readonly s = otpFieldStyles;

    protected readonly verification = new FormGroup({
        code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })
    });

    protected submitted = '';

    protected onSubmit(): void {
        this.submitted = this.verification.controls.code.value;
    }
}
