import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxOtpFieldInput, RdxOtpFieldRoot, RdxOtpFieldSeparator } from '@radix-ng/primitives/otp-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-groups-example',
    imports: [RdxOtpFieldRoot, RdxOtpFieldInput, RdxOtpFieldSeparator],
    template: `
        <div class="grid gap-1.5">
            <label class="demo-label mb-2 block" for="grouped-code">Backup code</label>
            <div
                class="flex items-center gap-2"
                id="grouped-code"
                [length]="8"
                [inputMode]="'text'"
                [validationType]="'alphanumeric'"
                aria-label="Grouped verification code"
                rdxOtpFieldRoot
            >
                <div class="flex gap-2">
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
                <div class="text-muted-foreground px-1" rdxOtpFieldSeparator>—</div>
                <div class="flex gap-2">
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
            </div>
            <p class="text-muted-foreground mt-2 text-sm">
                The visual separator groups the eight characters into two blocks.
            </p>
        </div>
    `
})
export class OtpFieldGroupsExample {}
