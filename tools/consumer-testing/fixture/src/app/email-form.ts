import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxNgControlField
} from '@radix-ng/primitives/field';

@Component({
    selector: 'consumer-email-form',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError,
        RdxNgControlField
    ],
    template: `
        <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field" rdxFieldRoot required>
                <label rdxFieldLabel>Email</label>
                <input rdxFieldControl rdxNgControlField type="email" formControlName="email" />
                <p rdxFieldDescription>Use the email connected to your account.</p>
                <p class="error" match="required" rdxFieldError>Email is required.</p>
                <p class="error" match="email" rdxFieldError>Enter a valid email address.</p>
            </div>
            <button type="submit">Submit</button>
        </form>
    `
})
export class EmailForm {
    private readonly builder = inject(FormBuilder);
    readonly form = this.builder.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });

    submit(): void {
        this.form.markAllAsTouched();
    }
}
