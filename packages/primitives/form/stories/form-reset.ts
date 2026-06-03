import { RdxFormErrors, RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formError, formField, formInput, formLabel, formReset, formSubmit } from './form.shared';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';

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
            rdxFormRoot
            [errors]="errors()"
            (onFormSubmit)="onSubmit($event)"
            (onClearErrors)="errors.set($event)"
            (reset)="verified.set(false)"
        >
            <div name="code" rdxFieldRoot [class]="field">
                <label rdxFieldLabel [class]="label">Access code</label>
                <input name="code" rdxFieldControl placeholder="1234" [class]="input" />
                <p #codeError="rdxFieldError" rdxFieldError [class]="error">{{ codeError.messages().join(' ') }}</p>
            </div>

            <div class="flex gap-2">
                <button type="submit" [class]="submit">Verify</button>
                <button type="reset" [class]="reset">Reset</button>
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
