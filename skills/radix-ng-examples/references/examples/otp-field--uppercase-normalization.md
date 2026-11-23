# OTP Field — Uppercase normalization

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

`normalizeValue` can transform accepted text. Keep normalization idempotent so repeated updates do not change an already normalized value.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxOtpFieldInput, RdxOtpFieldRoot } from '@radix-ng/primitives/otp-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-normalize-example',
    imports: [RdxOtpFieldRoot, RdxOtpFieldInput],
    template: `
        <div class="grid gap-1.5">
            <label class="demo-label mb-2 block" for="uppercase-code">Alphabetic code</label>
            <div
                class="flex items-center gap-2"
                id="uppercase-code"
                [length]="6"
                [normalizeValue]="uppercase"
                [validationType]="'alpha'"
                aria-label="Uppercase verification code"
                rdxOtpFieldRoot
            >
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    placeholder="A"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    placeholder="B"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    placeholder="C"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    placeholder="D"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    placeholder="E"
                    rdxOtpFieldInput
                />
                <input
                    class="demo-otp-field-slot placeholder:text-muted-foreground demo-focus size-10 shrink-0"
                    placeholder="F"
                    rdxOtpFieldInput
                />
            </div>
            <p class="text-muted-foreground mt-2 text-sm">
                Type lowercase or uppercase; the stored value is normalized to uppercase.
            </p>
        </div>
    `
})
export class OtpFieldNormalizeExample {
    protected readonly uppercase = (value: string): string => value.toUpperCase();
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
