# Autocomplete — Validation

> One example from the [Autocomplete](../components/autocomplete.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Bind the control's validity to `[invalid]` so the input reflects `data-invalid` / `aria-invalid`; the
error message and submit guard follow the standard reactive-forms pattern.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { cn, demoButton, demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

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
            <div [formControl]="fruit" [invalid]="showError()" rdxAutocompleteRoot>
                <div
                    [class]="cn(c.control, showError() && 'border-destructive focus-within:ring-destructive')"
                    rdxAutocompleteInputGroup
                >
                    <input [class]="c.input" rdxAutocompleteInput placeholder="Search a fruit…" aria-label="Fruit" />
                </div>

                <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                    <div [class]="c.popup" rdxAutocompletePopup>
                        <div [class]="c.list" rdxAutocompleteList aria-label="Fruits">
                            @for (item of fruits; track item) {
                                <div [class]="c.item" rdxAutocompleteItem>{{ item }}</div>
                            }
                        </div>
                        <div [class]="c.empty" rdxAutocompleteEmpty>No fruit found.</div>
                    </div>
                </div>
            </div>

            @if (showError()) {
                <p class="text-destructive text-sm">Please enter a fruit.</p>
            }

            <button [class]="cn(b.base, b.primary, b.size.md, 'self-start')" type="submit">Submit</button>

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
```
