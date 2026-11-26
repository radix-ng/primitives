# OTP Field — Default

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Copy the standalone component and follow the linked example setup.

```typescript
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
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
