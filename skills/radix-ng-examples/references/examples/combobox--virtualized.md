# Combobox — Virtualized

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

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
import {
    ComboboxItemHighlightedDetails,
    RdxComboboxEmpty,
    RdxComboboxInput,
    RdxComboboxItem,
    RdxComboboxItemIndicator,
    RdxComboboxList,
    RdxComboboxPopup,
    RdxComboboxPortal,
    RdxComboboxPositioner,
    RdxComboboxRoot
} from '@radix-ng/primitives/combobox';

import { injectVirtualizer } from '@tanstack/angular-virtual';

/**
 * Externally virtualized list of 10,000 items. The combobox owns filtering and index navigation
 * (`virtualized` + `[items]`); `@tanstack/angular-virtual` renders only the visible window. On each
 * keyboard/programmatic highlight change the demo scrolls the target index into view so the
 * highlighted row mounts before `aria-activedescendant` references it.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-virtualized-example',
    imports: [
        RdxComboboxRoot,
        RdxComboboxInput,
        RdxComboboxPortal,
        RdxComboboxPositioner,
        RdxComboboxPopup,
        RdxComboboxList,
        RdxComboboxItem,
        RdxComboboxItemIndicator,
        RdxComboboxEmpty,
        LucideCheck
    ],
    template: `
        <div
            #cmb="rdxComboboxRoot"
            [(value)]="value"
            [items]="items"
            (onItemHighlighted)="onHighlight($event)"
            virtualized
            rdxComboboxRoot
        >
            <div
                class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 w-64 items-center focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
            >
                <input
                    class="demo-combobox-input placeholder:text-muted-foreground h-full w-full pr-9 pl-3"
                    rdxComboboxInput
                    placeholder="Search 10,000 items…"
                    aria-label="Item"
                />
            </div>

            <div class="z-50 w-64 data-[closed]:pointer-events-none" *rdxComboboxPortal rdxComboboxPositioner>
                <div
                    class="border-border bg-popover text-popover-foreground z-50 mt-2 rounded-md border shadow-md data-[closed]:hidden"
                    rdxComboboxPopup
                >
                    <div class="demo-combobox-empty data-[empty]:py-6" rdxComboboxEmpty>No items found.</div>
                    <div class="flex flex-col" rdxComboboxList aria-label="Items">
                        <div class="max-h-60 overflow-auto overscroll-contain p-1" #scroll>
                            <div class="relative w-full" [style.height.px]="virtualizer.getTotalSize()">
                                @for (row of virtualizer.getVirtualItems(); track row.key) {
                                    <div
                                        class="data-highlighted:bg-primary data-highlighted:text-primary-foreground absolute top-0 left-0 flex w-full cursor-default items-center rounded-sm pr-2 pl-8 text-sm outline-none select-none data-[selected]:font-medium"
                                        [value]="cmb.filteredItems()[row.index]"
                                        [index]="row.index"
                                        [style.height.px]="row.size"
                                        [style.transform]="'translateY(' + row.start + 'px)'"
                                        rdxComboboxItem
                                    >
                                        <span
                                            class="absolute left-2 flex size-3.5 items-center justify-center"
                                            rdxComboboxItemIndicator
                                        >
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

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular`, `@tanstack/angular-virtual` when an example imports them.
