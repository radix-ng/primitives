# Select — Template-driven Forms

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

`[(ngModel)]` uses the same `ControlValueAccessor`. This example demonstrates the value round-trip,
submission, touched/dirty state, and `NgForm.resetForm()` while keeping the same Field anatomy.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { RdxFieldDescription, RdxFieldLabel, RdxFieldRoot, RdxNgControlField } from '@radix-ng/primitives/field';
import { cn, demoButton, demoSelect } from '../../storybook/styles';
import {
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-template-driven-forms',
    imports: [
        FormsModule,
        LucideCheck,
        LucideChevronDown,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldDescription,
        RdxNgControlField,
        RdxSelectRoot,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortal,
        RdxSelectPositioner,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator
    ],
    template: `
        <form class="flex w-72 flex-col gap-4" #fruitForm="ngForm" (ngSubmit)="submit(fruitForm)">
            <div class="flex flex-col gap-1.5" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Fruit</label>

                <div #fruitModel="ngModel" [(ngModel)]="fruit" name="fruit" rdxSelectRoot rdxNgControlField>
                    <button class="w-full" [class]="s.trigger" rdxSelectTrigger>
                        <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit…">
                            {{ selectedValue.slotText() }}
                        </span>
                        <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true"></svg>
                    </button>

                    <div *rdxSelectPortal [class]="s.positioner" [sideOffset]="4" align="start" rdxSelectPositioner>
                        <div [class]="s.popup" rdxSelectPopup>
                            <div [class]="s.list" rdxSelectList>
                                @for (option of options; track option) {
                                    <div [class]="s.item" [value]="option" rdxSelectItem>
                                        <span [class]="s.itemIndicator" rdxSelectItemIndicator>
                                            <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true"></svg>
                                        </span>
                                        <span rdxSelectItemText>{{ option }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <p class="text-muted-foreground text-sm" rdxFieldDescription>
                    ngModel owns the value while Select keeps its signal-first public API.
                </p>
            </div>

            <div class="flex gap-2">
                <button [class]="primaryButtonClass" type="submit">Submit</button>
                <button [class]="outlineButtonClass" (click)="reset(fruitForm)" type="button">Reset</button>
            </div>

            <p class="text-muted-foreground text-xs" aria-live="polite">
                Value: {{ fruit || 'empty' }} · {{ fruitModel.dirty ? 'Dirty' : 'Pristine' }} ·
                {{ fruitModel.touched ? 'Touched' : 'Untouched' }}
            </p>

            @if (submittedValue(); as value) {
                <p class="text-foreground text-sm" role="status">Submitted {{ value }}.</p>
            }
        </form>
    `
})
export class SelectTemplateDrivenForms {
    protected readonly s = demoSelect;

    protected readonly options = ['Apple', 'Banana', 'Blueberry'];
    protected fruit = 'Banana';
    protected readonly submittedValue = signal<string | null>(null);

    protected readonly primaryButtonClass = cn(demoButton.base, demoButton.primary, demoButton.size.md);
    protected readonly outlineButtonClass = cn(demoButton.base, demoButton.outline, demoButton.size.md);

    protected submit(form: NgForm): void {
        if (form.valid) {
            this.submittedValue.set(this.fruit);
        }
    }

    protected reset(form: NgForm): void {
        this.submittedValue.set(null);
        form.resetForm({ fruit: 'Banana' });
    }
}
```
