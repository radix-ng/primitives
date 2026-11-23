import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxComboboxEmpty,
    RdxComboboxInput,
    RdxComboboxItem,
    RdxComboboxItemIndicator,
    RdxComboboxList,
    RdxComboboxPopup,
    RdxComboboxPortal,
    RdxComboboxPositioner,
    RdxComboboxRoot,
    RdxComboboxTrigger
} from '@radix-ng/primitives/combobox';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-reactive-forms',
    imports: [
        RdxComboboxRoot,
        RdxComboboxInput,
        RdxComboboxTrigger,
        RdxComboboxPortal,
        RdxComboboxPositioner,
        RdxComboboxPopup,
        RdxComboboxList,
        RdxComboboxItem,
        RdxComboboxItemIndicator,
        RdxComboboxEmpty,
        ReactiveFormsModule,
        LucideChevronDown,
        LucideCheck
    ],
    template: `
        <form class="flex flex-col gap-3">
            <div [formControl]="fruit" rdxComboboxRoot>
                <div
                    class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 w-64 items-center focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
                >
                    <input
                        class="demo-combobox-input placeholder:text-muted-foreground h-full w-full pr-9 pl-3"
                        rdxComboboxInput
                        placeholder="Pick a fruit…"
                        aria-label="Fruit"
                    />
                    <button
                        class="demo-combobox-trigger absolute top-1/2 right-1 inline-flex size-7 -translate-y-1/2 items-center justify-center disabled:pointer-events-none"
                        rdxComboboxTrigger
                        aria-label="Open"
                    >
                        <svg lucideChevronDown size="16"></svg>
                    </button>
                </div>

                <div class="z-50 w-64 data-[closed]:pointer-events-none" *rdxComboboxPortal rdxComboboxPositioner>
                    <div
                        class="demo-combobox-popup mt-2 max-h-60 overflow-y-auto p-1 data-[closed]:hidden"
                        rdxComboboxPopup
                    >
                        <div class="flex flex-col" rdxComboboxList aria-label="Fruits">
                            @for (f of fruits; track f) {
                                <div
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex items-center py-1.5 pr-2 pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium"
                                    [value]="f"
                                    rdxComboboxItem
                                >
                                    <span
                                        class="absolute left-2 flex size-3.5 items-center justify-center"
                                        rdxComboboxItemIndicator
                                    >
                                        <svg lucideCheck size="14"></svg>
                                    </span>
                                    {{ f }}
                                </div>
                            }
                        </div>
                        <div class="demo-combobox-empty data-[empty]:py-6" rdxComboboxEmpty>No fruit found.</div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">
                Value:
                <code>{{ fruit.value ?? 'null' }}</code>
            </p>
        </form>
    `
})
export class ComboboxReactiveForms {
    readonly fruit = new FormControl<string | null>('Banana');
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange'];
}
