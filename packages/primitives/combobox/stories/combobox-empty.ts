import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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

/**
 * `RdxComboboxEmpty` renders only when no item matches the query — type something like "zzz" to see
 * it. The input also gets `data-list-empty` so the control itself can react.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-empty',
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
                    placeholder="Try typing 'zzz'…"
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
                    <div class="demo-combobox-empty data-[empty]:py-6" rdxComboboxEmpty>
                        No fruit matches your search.
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxEmpty {
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}
