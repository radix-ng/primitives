# OTP Field — Template-driven forms

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Use `[(ngModel)]` on the root to bind the complete string value.

```typescript
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxOtpFieldInput, RdxOtpFieldRoot } from '@radix-ng/primitives/otp-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-ngmodel-example',
    imports: [FormsModule, JsonPipe, RdxOtpFieldRoot, RdxOtpFieldInput],
    template: `
        <div class="grid gap-1.5">
            <label class="demo-label mb-2 block" for="template-code">Recovery code</label>
            <div
                class="flex items-center gap-2"
                id="template-code"
                [(ngModel)]="code"
                [length]="6"
                [autoComplete]="'one-time-code'"
                [inputMode]="'numeric'"
                name="recoveryCode"
                aria-label="Recovery code"
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
            <p class="text-muted-foreground text-sm">ngModel value: {{ code | json }}</p>
        </div>
    `
})
export class OtpFieldNgModelExample {
    protected code = '';
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
