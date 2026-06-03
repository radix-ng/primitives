import { cn, demoButton, demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

/**
 * Reactive forms with validation. The form value **is** the input string; its validity is bound to the
 * autocomplete `[invalid]` input, so the input reflects `data-invalid` / `aria-invalid` and the control
 * shows a destructive ring once touched. The error message and submit guard follow the standard pattern.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-validation',
    imports: [_importsAutocomplete, ReactiveFormsModule],
    template: `
        <form class="flex flex-col gap-3" (ngSubmit)="onSubmit()">
            <div rdxAutocompleteRoot [formControl]="fruit" [invalid]="showError()">
                <div
                    rdxAutocompleteInputGroup
                    [class]="cn(c.control, showError() && 'border-destructive focus-within:ring-destructive')"
                >
                    <input rdxAutocompleteInput placeholder="Search a fruit…" aria-label="Fruit" [class]="c.input" />
                </div>

                <div *rdxAutocompletePortal rdxAutocompletePositioner [class]="c.positioner">
                    <div rdxAutocompletePopup [class]="c.popup">
                        <div rdxAutocompleteList aria-label="Fruits" [class]="c.list">
                            @for (item of fruits; track item) {
                                <div rdxAutocompleteItem [class]="c.item">{{ item }}</div>
                            }
                        </div>
                        <div rdxAutocompleteEmpty [class]="c.empty">No fruit found.</div>
                    </div>
                </div>
            </div>

            @if (showError()) {
                <p class="text-destructive text-sm">Please enter a fruit.</p>
            }

            <button type="submit" [class]="cn(b.base, b.primary, b.size.md, 'self-start')">Submit</button>

            @if (submitted()) {
                <p class="text-muted-foreground text-sm">Submitted ✓</p>
            }
        </form>
    `
})
export class AutocompleteValidation {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly c = demoCombobox;

    readonly fruit = new FormControl('', { validators: Validators.required });
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
