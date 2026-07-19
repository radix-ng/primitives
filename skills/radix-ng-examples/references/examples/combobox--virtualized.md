# Combobox — Virtualized

> One example from the [Combobox](../components/combobox.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Render very large lists efficiently by virtualizing externally. Set `virtualized` and pass the full
`[items]` to the root; it owns filtering and navigation by index and exposes the matching subset as
`filteredItems()` for a virtualization library. Give each rendered `RdxComboboxItem` its `[index]`, and
on `onItemHighlighted` call the virtualizer's `scrollToIndex(index)` so the highlighted row mounts
before `aria-activedescendant` references it. Provide `itemToStringLabel` when items are objects (it
supplies both the filter text and the selection label). Disabled items outside the rendered window are
not skipped by keyboard navigation.

Virtualizing the list requires a virtualization library. Radix NG does **not** depend on or ship one —
install it in your app. The example below uses
[`@tanstack/angular-virtual`](https://tanstack.com/virtual/latest/docs/framework/angular/angular-virtual):

```bash
npm install @tanstack/angular-virtual
```

Then drive a scroll container with `injectVirtualizer`, render only `getVirtualItems()`, and bind each
row's `[index]` to the virtual item's index — exactly as in the example's "Show code".

```typescript
import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.Eager,
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

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
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
        </div>
    `
})
export class ComboboxVirtualizedExample {
    protected readonly c = demoCombobox;
    // The inner `#scroll` div owns scrolling + max-height, so the popup must NOT add its own (the
    // shared `demoCombobox.popup` bakes in `max-h-60 overflow-y-auto`, which would be a second scrollbar).
    protected readonly popup = cn(
        'z-50 mt-2 rounded-md border border-border bg-popover text-popover-foreground shadow-md',
        'data-[closed]:hidden'
    );
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
```
