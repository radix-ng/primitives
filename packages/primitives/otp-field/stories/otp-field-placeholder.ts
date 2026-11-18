import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxOtpFieldInput, RdxOtpFieldRoot } from '@radix-ng/primitives/otp-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-placeholder-example',
    imports: [RdxOtpFieldRoot, RdxOtpFieldInput],
    template: `
        <div class="grid gap-1.5">
            <label class="demo-label mb-2 block" id="placeholder-code-label" for="placeholder-code">
                Invitation code
            </label>
            <div
                class="flex items-center gap-2"
                id="placeholder-code"
                [length]="6"
                aria-labelledby="placeholder-code-label"
                rdxOtpFieldRoot
            >
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    placeholder="•"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    placeholder="•"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    placeholder="•"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    placeholder="•"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    placeholder="•"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    placeholder="•"
                    rdxOtpFieldInput
                />
            </div>
            <p class="text-muted-foreground mt-2 text-sm">Each empty slot shows its own placeholder.</p>
        </div>
    `
})
export class OtpFieldPlaceholderExample {}
