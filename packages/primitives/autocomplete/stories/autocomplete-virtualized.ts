import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import {
    AutocompleteItemHighlightedDetails,
    RdxAutocompleteEmpty,
    RdxAutocompleteInput,
    RdxAutocompleteInputGroup,
    RdxAutocompleteItem,
    RdxAutocompleteList,
    RdxAutocompletePopup,
    RdxAutocompletePortal,
    RdxAutocompletePositioner,
    RdxAutocompleteRoot
} from '@radix-ng/primitives/autocomplete';

import { injectVirtualizer } from '@tanstack/angular-virtual';

/**
 * Externally virtualized list of 10,000 items. The autocomplete owns filtering and index navigation
 * (`virtualized` + `[items]`); `@tanstack/angular-virtual` renders only the visible window. On each
 * keyboard/programmatic highlight change the demo scrolls the target index into view so the
 * highlighted row mounts before `aria-activedescendant` references it.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-virtualized-example',
    imports: [
        RdxAutocompleteRoot,
        RdxAutocompleteInputGroup,
        RdxAutocompleteInput,
        RdxAutocompletePortal,
        RdxAutocompletePositioner,
        RdxAutocompletePopup,
        RdxAutocompleteList,
        RdxAutocompleteItem,
        RdxAutocompleteEmpty
    ],
    template: `
        <div
            #ac="rdxAutocompleteRoot"
            [(value)]="value"
            [items]="items"
            (onItemHighlighted)="onHighlight($event)"
            virtualized
            rdxAutocompleteRoot
        >
            <div
                class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 w-64 items-center focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
                rdxAutocompleteInputGroup
            >
                <input
                    class="demo-combobox-input placeholder:text-muted-foreground h-full w-full pr-9 pl-3"
                    rdxAutocompleteInput
                    placeholder="Search 10,000 items…"
                    aria-label="Item"
                />
            </div>

            <div class="z-50 w-64 data-[closed]:pointer-events-none" *rdxAutocompletePortal rdxAutocompletePositioner>
                <div
                    class="border-border bg-popover text-popover-foreground z-50 mt-2 rounded-md border shadow-md data-[closed]:hidden"
                    rdxAutocompletePopup
                >
                    <div class="demo-combobox-empty data-[empty]:py-6" rdxAutocompleteEmpty>No items found.</div>
                    <div class="flex flex-col" rdxAutocompleteList aria-label="Items">
                        <div class="max-h-60 overflow-auto overscroll-contain p-1" #scroll>
                            <div class="relative w-full" [style.height.px]="virtualizer.getTotalSize()">
                                @for (row of virtualizer.getVirtualItems(); track row.key) {
                                    <div
                                        class="data-highlighted:bg-primary data-highlighted:text-primary-foreground absolute top-0 left-0 flex w-full cursor-default items-center rounded-sm px-2 text-sm outline-none select-none data-[selected]:font-medium"
                                        [value]="ac.filteredItems()[row.index]"
                                        [index]="row.index"
                                        [style.height.px]="row.size"
                                        [style.transform]="'translateY(' + row.start + 'px)'"
                                        rdxAutocompleteItem
                                    >
                                        {{ ac.filteredItems()[row.index] }}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteVirtualizedExample {
    readonly value = signal('');

    /** 10,000 string items — labels double as filter text, so no `itemToStringValue` is needed here. */
    protected readonly items = Array.from(
        { length: 10000 },
        (_, index) => `Item ${String(index + 1).padStart(5, '0')}`
    );

    private readonly scrollEl = viewChild<ElementRef<HTMLDivElement>>('scroll');
    private readonly root = viewChild(RdxAutocompleteRoot);

    protected readonly virtualizer = injectVirtualizer(() => ({
        count: this.root()?.filteredItems().length ?? 0,
        estimateSize: () => 36,
        overscan: 12,
        getItemKey: (index: number) => index,
        scrollElement: this.scrollEl()
    }));

    onHighlight(details: AutocompleteItemHighlightedDetails): void {
        if (details.index < 0 || details.reason === 'pointer') {
            return;
        }
        queueMicrotask(() => this.virtualizer.scrollToIndex(details.index, { align: 'auto' }));
    }
}
