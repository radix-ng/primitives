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
import { injectId } from '@radix-ng/primitives/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-default',
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
        <div class="text-foreground flex flex-col items-start gap-1" [(value)]="value" rdxComboboxRoot>
            <label class="text-sm font-bold" [htmlFor]="inputId">Fruit</label>
            <div
                class="border-foreground bg-background focus-within:outline-ring relative flex h-8 w-56 max-w-full items-center border focus-within:outline-2 focus-within:-outline-offset-1"
            >
                <input
                    class="h-full w-full ps-2 pe-8 text-sm outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400 any-pointer-coarse:text-base"
                    [id]="inputId"
                    rdxComboboxInput
                    placeholder="Search a fruit…"
                />
                <button
                    class="demo-button demo-button-ghost absolute end-0 top-0 h-full w-6"
                    rdxComboboxTrigger
                    aria-label="Open"
                >
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div class="z-50 data-closed:pointer-events-none" *rdxComboboxPortal [sideOffset]="4" rdxComboboxPositioner>
                <div class="demo-popup demo-popup-motion w-(--anchor-width) max-w-(--available-width)" rdxComboboxPopup>
                    <div
                        class="max-h-[min(22.5rem,var(--available-height))] scroll-py-1 overflow-y-auto overscroll-contain py-1 data-empty:p-0"
                        rdxComboboxList
                        aria-label="Fruits"
                    >
                        @for (fruit of fruits; track fruit) {
                            <div
                                class="demo-option relative flex items-center px-2 py-2 ps-8 leading-4"
                                [value]="fruit"
                                rdxComboboxItem
                            >
                                <span
                                    class="absolute start-2 flex size-3.5 items-center justify-center"
                                    rdxComboboxItemIndicator
                                >
                                    <svg lucideCheck size="14"></svg>
                                </span>
                                {{ fruit }}
                            </div>
                        }
                    </div>
                    <div class="text-muted-foreground px-2 text-sm leading-4 data-empty:py-4" rdxComboboxEmpty>
                        No fruit found.
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxDefault {
    protected readonly inputId = injectId('combobox-fruit-');

    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
