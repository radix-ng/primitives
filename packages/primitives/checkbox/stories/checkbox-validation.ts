import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { cn, demoButton, demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

/**
 * Reactive forms with validation: `Validators.requiredTrue` forces the box to be
 * ticked, the error shows after the field is touched, and submit is guarded.
 */
@Component({
    selector: 'checkbox-validation-example',
    imports: [
        ReactiveFormsModule,
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        LucideCheck
    ],
    template: `
        <form class="flex flex-col gap-3" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="flex items-center gap-3">
                <div rdxCheckboxRoot formControlName="terms">
                    <button id="terms" [class]="c.button" rdxCheckboxButton>
                        <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="terms">
                    I accept the terms and conditions
                </label>
            </div>

            @if (form.controls.terms.invalid && form.controls.terms.touched) {
                <p class="text-destructive text-sm">You must accept the terms to continue.</p>
            }

            <button [class]="cn(b.base, b.primary, b.size.md, 'self-start')" type="submit">Submit</button>

            @if (submitted()) {
                <p class="text-muted-foreground text-sm">Submitted ✓</p>
            }
        </form>
    `
})
export class CheckboxValidationExample {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly c = demoCheckbox;

    private readonly formBuilder = inject(FormBuilder);

    readonly form = this.formBuilder.group({
        terms: this.formBuilder.control(false, Validators.requiredTrue)
    });

    readonly submitted = signal(false);

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.controls.terms.markAsTouched();
            return;
        }
        this.submitted.set(true);
    }
}
