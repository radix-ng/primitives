import { cn, demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete, AutocompleteItemHighlightedDetails, RdxAutocompleteRoot } from '../index';
import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
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
    imports: [_importsAutocomplete],
    template: `
        <div
            #ac="rdxAutocompleteRoot"
            virtualized
            rdxAutocompleteRoot
            [items]="items"
            [(value)]="value"
            (onItemHighlighted)="onHighlight($event)"
        >
            <div rdxAutocompleteInputGroup [class]="c.control">
                <input rdxAutocompleteInput placeholder="Search 10,000 items…" aria-label="Item" [class]="c.input" />
            </div>

            <div *rdxAutocompletePortal rdxAutocompletePositioner [class]="c.positioner">
                <div rdxAutocompletePopup [class]="popup">
                    <div rdxAutocompleteEmpty [class]="c.empty">No items found.</div>
                    <div rdxAutocompleteList aria-label="Items" [class]="c.list">
                        <div #scroll [class]="scroller">
                            <div [class]="spacer" [style.height.px]="virtualizer.getTotalSize()">
                                @for (row of virtualizer.getVirtualItems(); track row.key) {
                                    <div
                                        rdxAutocompleteItem
                                        [class]="item"
                                        [value]="ac.filteredItems()[row.index]"
                                        [index]="row.index"
                                        [style.height.px]="row.size"
                                        [style.transform]="'translateY(' + row.start + 'px)'"
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
    protected readonly c = demoCombobox;
    protected readonly popup = cn(
        'z-50 mt-2 rounded-md border border-border bg-popover text-popover-foreground shadow-md',
        'data-[closed]:hidden'
    );
    protected readonly scroller = 'max-h-60 overflow-auto overscroll-contain p-1';
    protected readonly spacer = 'relative w-full';
    protected readonly item = cn(
        'absolute left-0 top-0 flex w-full cursor-default select-none items-center rounded-sm px-2 text-sm outline-none',
        'data-[highlighted]:bg-muted data-[selected]:font-medium'
    );

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
