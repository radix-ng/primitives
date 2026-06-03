import { cn, demoButton, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';

/**
 * Reactive forms with validation. The control's validity is bound to the combobox `[invalid]` input,
 * so the input reflects `data-invalid` / `aria-invalid` and the control shows a destructive ring once
 * touched. The error message and submit guard follow the standard reactive-forms pattern.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-validation',
    imports: [_importsCombobox, ReactiveFormsModule, LucideChevronDown, LucideCheck],
    template: `
        <form class="flex flex-col gap-3" (ngSubmit)="onSubmit()">
            <div rdxComboboxRoot [formControl]="fruit" [invalid]="showError()">
                <div [class]="cn(c.control, showError() && 'border-destructive focus-within:ring-destructive')">
                    <input rdxComboboxInput placeholder="Pick a fruit…" aria-label="Fruit" [class]="c.input" />
                    <button rdxComboboxTrigger aria-label="Open" [class]="c.trigger">
                        <svg lucideChevronDown size="16"></svg>
                    </button>
                </div>

                <div *rdxComboboxPortal rdxComboboxPositioner [class]="c.positioner">
                    <div rdxComboboxPopup [class]="c.popup">
                        <div rdxComboboxList aria-label="Fruits" [class]="c.list">
                            @for (f of fruits; track f) {
                                <div rdxComboboxItem [class]="c.item" [value]="f">
                                    <span rdxComboboxItemIndicator [class]="c.itemIndicator">
                                        <svg lucideCheck size="14"></svg>
                                    </span>
                                    {{ f }}
                                </div>
                            }
                        </div>
                        <div rdxComboboxEmpty [class]="c.empty">No fruit found.</div>
                    </div>
                </div>
            </div>

            @if (showError()) {
                <p class="text-destructive text-sm">Please pick a fruit.</p>
            }

            <button type="submit" [class]="cn(b.base, b.primary, b.size.md, 'self-start')">Submit</button>

            @if (submitted()) {
                <p class="text-muted-foreground text-sm">Submitted ✓</p>
            }
        </form>
    `
})
export class ComboboxValidation {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly c = demoCombobox;

    readonly fruit = new FormControl<string | null>(null, { validators: Validators.required });
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange'];
    readonly submitted = signal(false);

    protected showError(): boolean {
        return this.fruit.invalid && this.fruit.touched;
    }

    onSubmit(): void {
        if (this.fruit.invalid) {
            this.fruit.markAsTouched();
            this.submitted.set(false);
            return;
        }
        this.submitted.set(true);
    }
}
