# OTP Field — Reactive Forms

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

The root works with `formControlName` and forwards required validity to the form-associated hidden control. When wrapped in `rdxFieldRoot`, it registers the first slot as the label target and inherits the Field's disabled and required state.

```typescript
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdxOtpFieldInput, RdxOtpFieldRoot } from '@radix-ng/primitives/otp-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-otp-field-reactive-forms-example',
    imports: [JsonPipe, ReactiveFormsModule, RdxOtpFieldRoot, RdxOtpFieldInput],
    template: `
        <form class="grid max-w-md gap-5" [formGroup]="verification" (ngSubmit)="onSubmit()">
            <div class="grid gap-1.5">
                <label class="demo-label mb-2 block" for="form-code">Verification code</label>
                <div
                    class="flex items-center gap-2"
                    id="form-code"
                    [length]="6"
                    [autoComplete]="'one-time-code'"
                    [inputMode]="'numeric'"
                    formControlName="code"
                    name="code"
                    required
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
                <p class="text-muted-foreground mt-2 text-sm">Reactive Forms owns the value and required validation.</p>
            </div>

            <button class="demo-button demo-button-primary px-4 py-2" type="submit">Verify</button>
            <p class="text-muted-foreground text-sm">Form value: {{ verification.value | json }}</p>
            @if (submitted) {
                <p class="text-foreground text-sm">Submitted code: {{ submitted }}</p>
            }
        </form>
    `
})
export class OtpFieldReactiveFormsExample {
    protected readonly verification = new FormGroup({
        code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })
    });

    protected submitted = '';

    protected onSubmit(): void {
        this.submitted = this.verification.controls.code.value;
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
