import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxComboboxEmpty,
    RdxComboboxGroup,
    RdxComboboxGroupLabel,
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

/** Options organized into sections with `RdxComboboxGroup` / `RdxComboboxGroupLabel`. A group hides
 * its heading automatically when all of its items are filtered out. */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-grouped',
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
        RdxComboboxGroup,
        RdxComboboxGroupLabel,
        RdxComboboxEmpty,
        LucideChevronDown,
        LucideCheck
    ],
    template: `
        <div [(value)]="value" rdxComboboxRoot>
            <div
                class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 w-64 items-center focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
            >
                <input
                    class="demo-combobox-input placeholder:text-muted-foreground h-full w-full pr-9 pl-3"
                    rdxComboboxInput
                    placeholder="Search produce…"
                    aria-label="Produce"
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
                    <div class="flex flex-col" rdxComboboxList aria-label="Produce">
                        <div rdxComboboxGroup>
                            <div class="demo-menu-group-label px-2 py-1.5" rdxComboboxGroupLabel>Fruits</div>
                            @for (fruit of fruits; track fruit) {
                                <div
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex items-center py-1.5 pr-2 pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium"
                                    [value]="fruit"
                                    rdxComboboxItem
                                >
                                    <span
                                        class="absolute left-2 flex size-3.5 items-center justify-center"
                                        rdxComboboxItemIndicator
                                    >
                                        <svg lucideCheck size="14"></svg>
                                    </span>
                                    {{ fruit }}
                                </div>
                            }
                        </div>
                        <div rdxComboboxGroup>
                            <div class="demo-menu-group-label px-2 py-1.5" rdxComboboxGroupLabel>Vegetables</div>
                            @for (vegetable of vegetables; track vegetable) {
                                <div
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex items-center py-1.5 pr-2 pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium"
                                    [value]="vegetable"
                                    rdxComboboxItem
                                >
                                    <span
                                        class="absolute left-2 flex size-3.5 items-center justify-center"
                                        rdxComboboxItemIndicator
                                    >
                                        <svg lucideCheck size="14"></svg>
                                    </span>
                                    {{ vegetable }}
                                </div>
                            }
                        </div>
                    </div>
                    <div class="demo-combobox-empty data-[empty]:py-6" rdxComboboxEmpty>No produce found.</div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxGrouped {
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Grape', 'Orange'];
    readonly vegetables = ['Broccoli', 'Carrot', 'Leek', 'Spinach'];
}
