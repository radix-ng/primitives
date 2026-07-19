# Form — Reset

> One example from the [Form](../components/form.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Native `reset` clears external errors and every field's interaction state, and re-syncs `filled` to the
reverted values.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormErrors, RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formError, formField, formInput, formLabel, formReset, formSubmit } from './form.shared';

/**
 * Native `reset` clears external errors and every field's interaction state (touched/dirty/focused),
 * and re-syncs `filled` to the reverted values — no manual wiring. Submit a wrong code to surface a
 * server error, then press Reset; submit `1234` to pass.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-reset-example',
    imports: [RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldError],
    template: `
        <form
            class="flex w-80 flex-col gap-4"
            [errors]="errors()"
            (onFormSubmit)="onSubmit($event)"
            (onClearErrors)="errors.set($event)"
            (reset)="verified.set(false)"
            rdxFormRoot
        >
            <div [class]="field" name="code" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Access code</label>
                <input [class]="input" name="code" rdxFieldControl placeholder="1234" />
                <p #codeError="rdxFieldError" [class]="error" rdxFieldError>{{ codeError.messages().join(' ') }}</p>
            </div>

            <div class="flex gap-2">
                <button [class]="submit" type="submit">Verify</button>
                <button [class]="reset" type="reset">Reset</button>
            </div>
            @if (verified()) {
                <p class="text-muted-foreground text-sm">Code accepted.</p>
            }
        </form>
    `
})
export class FormResetExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly error = formError;
    protected readonly submit = formSubmit;
    protected readonly reset = formReset;

    readonly errors = signal<RdxFormErrors | null>(null);
    readonly verified = signal(false);

    onSubmit(event: RdxFormSubmitEvent): void {
        if (String(event.values['code'] ?? '') === '1234') {
            this.errors.set(null);
            this.verified.set(true);
        } else {
            this.verified.set(false);
            this.errors.set({ code: 'Invalid code, try 1234.' });
        }
    }
}
```
