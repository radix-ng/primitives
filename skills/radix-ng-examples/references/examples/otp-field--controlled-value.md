# OTP Field — Controlled value

> One example from the [OTP Field](../components/otp-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Bind `[controlledValue]` when the parent decides whether and when to apply an edit. Paste a four-digit
code and choose **Apply edit**. The field moves focus to the last slot, completes the code and
submits the applied value under the surrounding Field's name.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxOtpFieldInput, RdxOtpFieldRoot } from '@radix-ng/primitives/otp-field';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-otp-field-controlled-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxOtpFieldRoot, RdxOtpFieldInput],
    template: `
        <form class="flex flex-col items-start gap-3" (submit)="submit($event)">
            <div class="flex flex-col gap-1" name="verificationCode" rdxFieldRoot>
                <label class="text-foreground text-sm font-bold" rdxFieldLabel>Verification code</label>
                <div
                    class="flex items-center gap-2"
                    [length]="4"
                    [controlledValue]="code()"
                    (onValueChange)="proposed.set($event.value)"
                    autoSubmit
                    required
                    rdxOtpFieldRoot
                >
                    <input class="demo-input size-10 shrink-0 text-center text-base" rdxOtpFieldInput />
                    <input class="demo-input size-10 shrink-0 text-center text-base" rdxOtpFieldInput />
                    <input class="demo-input size-10 shrink-0 text-center text-base" rdxOtpFieldInput />
                    <input class="demo-input size-10 shrink-0 text-center text-base" rdxOtpFieldInput />
                </div>
            </div>
            <button
                class="demo-button demo-button-outline h-9 px-4"
                [disabled]="proposed() === undefined"
                (click)="apply()"
                type="button"
            >
                Apply edit
            </button>
            @if (submitted() !== null) {
                <p class="text-sm" role="status">Submitted code {{ submitted() }}</p>
            }
        </form>
    `
})
export class OtpFieldControlledExample {
    protected readonly code = signal('');
    protected readonly proposed = signal<string | undefined>(undefined);
    protected readonly submitted = signal<FormDataEntryValue | null>(null);

    protected apply(): void {
        const next = this.proposed();
        if (next === undefined) return;
        this.code.set(next);
        this.proposed.set(undefined);
    }

    protected submit(event: Event): void {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;
        this.submitted.set(new FormData(form).get('verificationCode'));
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
