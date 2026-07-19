# Combobox — Validation

> One example from the [Combobox](../components/combobox.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Bind the control's validity to `[invalid]` so the input reflects `data-invalid` / `aria-invalid`; the
error message and submit guard follow the standard reactive-forms pattern.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { cn, demoButton, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

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
            <div [formControl]="fruit" [invalid]="showError()" rdxComboboxRoot>
                <div [class]="cn(c.control, showError() && 'border-destructive focus-within:ring-destructive')">
                    <input [class]="c.input" rdxComboboxInput placeholder="Pick a fruit…" aria-label="Fruit" />
                    <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                        <svg lucideChevronDown size="16"></svg>
                    </button>
                </div>

                <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                    <div [class]="c.popup" rdxComboboxPopup>
                        <div [class]="c.list" rdxComboboxList aria-label="Fruits">
                            @for (f of fruits; track f) {
                                <div [class]="c.item" [value]="f" rdxComboboxItem>
                                    <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                        <svg lucideCheck size="14"></svg>
                                    </span>
                                    {{ f }}
                                </div>
                            }
                        </div>
                        <div [class]="c.empty" rdxComboboxEmpty>No fruit found.</div>
                    </div>
                </div>
            </div>

            @if (showError()) {
                <p class="text-destructive text-sm">Please pick a fruit.</p>
            }

            <button [class]="cn(b.base, b.primary, b.size.md, 'self-start')" type="submit">Submit</button>

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
```
