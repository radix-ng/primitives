import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxOtpFieldInput, RdxOtpFieldRoot } from '@radix-ng/primitives/otp-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-default-example',
    imports: [RdxOtpFieldRoot, RdxOtpFieldInput],
    template: `
        <div class="flex w-full max-w-80 flex-col items-start gap-1">
            <label class="text-foreground text-sm font-bold" for="verification-code">Verification code</label>
            <div
                class="flex items-center gap-2"
                id="verification-code"
                [length]="6"
                [autoComplete]="'one-time-code'"
                [inputMode]="'numeric'"
                name="verificationCode"
                aria-label="Verification code"
                rdxOtpFieldRoot
            >
                <input class="demo-input size-10 shrink-0 text-center text-base" rdxOtpFieldInput />
                <input class="demo-input size-10 shrink-0 text-center text-base" rdxOtpFieldInput />
                <input class="demo-input size-10 shrink-0 text-center text-base" rdxOtpFieldInput />
                <input class="demo-input size-10 shrink-0 text-center text-base" rdxOtpFieldInput />
                <input class="demo-input size-10 shrink-0 text-center text-base" rdxOtpFieldInput />
                <input class="demo-input size-10 shrink-0 text-center text-base" rdxOtpFieldInput />
            </div>
            <p class="text-muted-foreground text-sm">Enter the six-digit code sent to your device.</p>
        </div>
    `
})
export class OtpFieldDefaultExample {}
