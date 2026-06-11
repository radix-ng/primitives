import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { injectVirtualizer } from '@tanstack/angular-virtual';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ComboboxItemHighlightedDetails, RdxComboboxRoot } from '../src/combobox-root';

/**
 * Externally virtualized list of 10,000 items. The combobox owns filtering and index navigation
 * (`virtualized` + `[items]`); `@tanstack/angular-virtual` renders only the visible window. On each
 * keyboard/programmatic highlight change the demo scrolls the target index into view so the
 * highlighted row mounts before `aria-activedescendant` references it.
 */
@Component({
    selector: 'combobox-virtualized-example',
    imports: [_importsCombobox, LucideCheck],
    template: `
        <div
            #cmb="rdxComboboxRoot"
            [(value)]="value"
            [items]="items"
            (onItemHighlighted)="onHighlight($event)"
            virtualized
            rdxComboboxRoot
        >
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Search 10,000 items…" aria-label="Item" />
            </div>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="popup" rdxComboboxPopup>
                            <div [class]="c.empty" rdxComboboxEmpty>No items found.</div>
                            <div [class]="c.list" rdxComboboxList aria-label="Items">
                                <div #scroll [class]="scroller">
                                    <div [class]="spacer" [style.height.px]="virtualizer.getTotalSize()">
                                        @for (row of virtualizer.getVirtualItems(); track row.key) {
                                            <div
                                                [class]="item"
                                                [value]="cmb.filteredItems()[row.index]"
                                                [index]="row.index"
                                                [style.height.px]="row.size"
                                                [style.transform]="'translateY(' + row.start + 'px)'"
                                                rdxComboboxItem
                                            >
                                                <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                                    <svg lucideCheck size="14"></svg>
                                                </span>
                                                {{ cmb.filteredItems()[row.index] }}
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class ComboboxVirtualizedExample {
    protected readonly c = demoCombobox;
    // The popup is not the scroll container here — the inner `#scroll` div is — so drop its overflow.
    protected readonly popup = cn(demoCombobox.popup, 'overflow-hidden p-0');
    protected readonly scroller = 'max-h-60 overflow-auto overscroll-contain p-1';
    protected readonly spacer = 'relative w-full';
    // Absolutely positioned rows (no `relative` from `demoCombobox.item`) translated by the virtualizer.
    protected readonly item = cn(
        'absolute left-0 top-0 flex w-full cursor-default select-none items-center rounded-sm pl-8 pr-2 text-sm outline-none',
        'data-[highlighted]:bg-muted data-[selected]:font-medium'
    );

    readonly value = signal<string | null>(null);

    /** 10,000 string items — labels double as filter text, so no `itemToStringLabel` is needed here. */
    protected readonly items = Array.from(
        { length: 10000 },
        (_, index) => `Item ${String(index + 1).padStart(5, '0')}`
    );

    private readonly root = viewChild(RdxComboboxRoot);
    private readonly scrollEl = viewChild<ElementRef<HTMLDivElement>>('scroll');

    protected readonly virtualizer = injectVirtualizer(() => ({
        count: this.root()?.filteredItems().length ?? 0,
        estimateSize: () => 36,
        overscan: 12,
        getItemKey: (index: number) => index,
        scrollElement: this.scrollEl()
    }));

    /**
     * Keep the highlighted index in view. Pointer hover never scrolls; keyboard navigation and
     * programmatic highlights (`reason: 'none'`) scroll the (possibly unmounted) row into view with
     * minimal movement so its element mounts before `aria-activedescendant` points at it.
     */
    onHighlight(details: ComboboxItemHighlightedDetails): void {
        if (details.index < 0 || details.reason === 'pointer') {
            return;
        }
        queueMicrotask(() => this.virtualizer.scrollToIndex(details.index, { align: 'auto' }));
    }
}
