# Select — Template-driven Forms

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

`[(ngModel)]` uses the same `ControlValueAccessor`. This example demonstrates the value round-trip,
submission, touched/dirty state, and `NgForm.resetForm()` while keeping the same Field anatomy.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { RdxFieldDescription, RdxFieldLabel, RdxFieldRoot, RdxNgControlField } from '@radix-ng/primitives/field';
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
} from '@radix-ng/primitives/select';

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
                    <button
                        class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-full items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        rdxSelectTrigger
                    >
                        <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit…">
                            {{ selectedValue.slotText() }}
                        </span>
                        <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true"></svg>
                    </button>

                    <div class="z-[100]" *rdxSelectPortal [sideOffset]="4" align="start" rdxSelectPositioner>
                        <div
                            class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                            rdxSelectPopup
                        >
                            <div class="p-1" rdxSelectList>
                                @for (option of options; track option) {
                                    <div
                                        class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        [value]="option"
                                        rdxSelectItem
                                    >
                                        <span
                                            class="absolute start-0 inline-flex w-6 items-center justify-center"
                                            rdxSelectItemIndicator
                                        >
                                            <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true"></svg>
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
                <button class="demo-button demo-button-primary h-9 px-4" type="submit">Submit</button>
                <button class="demo-button demo-button-outline h-9 px-4" (click)="reset(fruitForm)" type="button">
                    Reset
                </button>
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
    protected readonly options = ['Apple', 'Banana', 'Blueberry'];
    protected fruit = 'Banana';
    protected readonly submittedValue = signal<string | null>(null);

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

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.

#### `./select-typed-control.ts`

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    provideRdxSelectRoot,
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
} from '@radix-ng/primitives/select';

/** Application-owned markup; all state, events and form bindings are inherited from the primitive. */
@Component({
    selector: 'example-select',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideRdxSelectRoot(SelectTypedControl)],
    imports: [
        LucideCheck,
        LucideChevronDown,
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
        <button
            class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-64 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
            rdxSelectTrigger
        >
            <span #display="rdxSelectedValue" [placeholder]="placeholder()" rdxSelectValue>
                {{ display.slotText() }}
            </span>
            <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
        </button>
        <div class="z-[100]" *rdxSelectPortal [sideOffset]="4" align="start" rdxSelectPositioner>
            <div
                class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                rdxSelectPopup
            >
                <div class="p-1" rdxSelectList>
                    @for (option of options(); track option) {
                        <div
                            class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            [value]="option"
                            rdxSelectItem
                        >
                            <span
                                class="absolute start-0 inline-flex w-6 items-center justify-center"
                                aria-hidden="true"
                                rdxSelectItemIndicator
                            >
                                <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
                            </span>
                            <span rdxSelectItemText>{{ itemToStringLabel()?.(option) ?? option }}</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    `
})
export class SelectTypedControl<Value = unknown, Multiple extends boolean = false> extends RdxSelectRoot<
    Value,
    Multiple
> {
    readonly options = input.required<readonly Value[]>();
    readonly placeholder = input('Select an option');
}
```
