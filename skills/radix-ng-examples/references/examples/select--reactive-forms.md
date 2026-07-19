# Select — Reactive Forms

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Bind `formControl` directly on `rdxSelectRoot`. Angular owns programmatic writes, disabled state,
dirty/touched tracking, and reset; Select keeps the visible value synchronized even before the popup
has opened.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { RdxFieldDescription, RdxFieldLabel, RdxFieldRoot, RdxNgControlField } from '@radix-ng/primitives/field';
import { cn, demoButton, demoFocusRing } from '../../storybook/styles';
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
    selector: 'select-reactive-forms',
    imports: [
        ReactiveFormsModule,
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
        <form class="flex w-72 flex-col gap-4" (ngSubmit)="submit()">
            <div class="flex flex-col gap-1.5" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Fruit</label>

                <div [formControl]="fruit" rdxSelectRoot rdxNgControlField>
                    <button [class]="triggerClass" rdxSelectTrigger>
                        <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit…">
                            {{ selectedValue.slotText() }}
                        </span>
                        <svg class="size-4" lucideChevronDown></svg>
                    </button>

                    <div class="z-[100]" *rdxSelectPortal [sideOffset]="4" align="start" rdxSelectPositioner>
                        <div [class]="popupClass" rdxSelectPopup>
                            <div class="p-1" rdxSelectList>
                                @for (option of options; track option) {
                                    <div [class]="itemClass" [value]="option" rdxSelectItem>
                                        <span
                                            class="absolute left-2 inline-flex size-4 items-center justify-center"
                                            rdxSelectItemIndicator
                                        >
                                            <svg class="size-4" lucideCheck></svg>
                                        </span>
                                        <span rdxSelectItemText>{{ option }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <p class="text-muted-foreground text-sm" rdxFieldDescription>
                    The FormControl owns value, disabled, dirty, touched, and reset state.
                </p>
            </div>

            <div class="flex flex-wrap gap-2">
                <button [class]="primaryButtonClass" type="submit">Submit</button>
                <button [class]="outlineButtonClass" (click)="fruit.reset('Banana')" type="button">Reset</button>
                <button [class]="secondaryButtonClass" (click)="toggleDisabled()" type="button">
                    {{ fruit.disabled ? 'Enable' : 'Disable' }}
                </button>
            </div>

            <p class="text-muted-foreground text-xs" aria-live="polite">
                Value: {{ fruit.value }} · {{ fruit.dirty ? 'Dirty' : 'Pristine' }} ·
                {{ fruit.touched ? 'Touched' : 'Untouched' }}
            </p>

            @if (submittedValue(); as value) {
                <p class="text-foreground text-sm" role="status">Submitted {{ value }}.</p>
            }
        </form>
    `
})
export class SelectReactiveForms {
    protected readonly options = ['Apple', 'Banana', 'Blueberry'];
    protected readonly fruit = new FormControl('Banana', { nonNullable: true });
    protected readonly submittedValue = signal<string | null>(null);

    protected readonly triggerClass = cn(
        'border-border bg-background text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted',
        'inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm',
        'disabled:cursor-not-allowed disabled:opacity-50',
        demoFocusRing
    );
    protected readonly popupClass =
        'border-border bg-popover text-popover-foreground min-w-40 rounded-md border shadow-md';
    protected readonly itemClass = cn(
        'text-popover-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground',
        'relative flex h-8 cursor-default items-center rounded-sm pr-8 pl-8 text-sm outline-none select-none',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
    );
    protected readonly primaryButtonClass = cn(demoButton.base, demoButton.primary, demoButton.size.md);
    protected readonly outlineButtonClass = cn(demoButton.base, demoButton.outline, demoButton.size.md);
    protected readonly secondaryButtonClass = cn(demoButton.base, demoButton.secondary, demoButton.size.md);

    protected submit(): void {
        this.submittedValue.set(this.fruit.value);
    }

    protected toggleDisabled(): void {
        this.fruit.disabled ? this.fruit.enable() : this.fruit.disable();
    }
}
```
