import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { RdxOtpFieldInput, RdxOtpFieldRoot } from '@radix-ng/primitives/otp-field';

type Verification = { code: string };

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-signal-forms-example',
    imports: [FormField, JsonPipe, RdxOtpFieldRoot, RdxOtpFieldInput],
    template: `
        <div class="grid gap-1.5">
            <label class="demo-label mb-2 block" for="signal-code">One-time code</label>
            <div
                class="flex items-center gap-2"
                id="signal-code"
                [formField]="verificationForm.code"
                [length]="6"
                [autoComplete]="'one-time-code'"
                [inputMode]="'numeric'"
                aria-label="Verification code"
                rdxOtpFieldRoot
            >
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    rdxOtpFieldInput
                />
            </div>
            <p class="text-muted-foreground text-sm">Signal Forms model: {{ model() | json }}</p>
        </div>
    `
})
export class OtpFieldSignalFormsExample {
    protected readonly model = signal<Verification>({ code: '' });
    protected readonly verificationForm = form(this.model, (path) => {
        required(path.code, { message: 'Enter a code.' });
    });
}
