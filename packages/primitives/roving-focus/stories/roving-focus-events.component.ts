import { Component } from '@angular/core';
import { RdxRovingFocusGroupDirective, RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';

@Component({
    selector: 'rvg-events',
    imports: [RdxRovingFocusItemDirective, RdxRovingFocusGroupDirective],
    template: `
        <div
            class="flex gap-2"
            [orientation]="'horizontal'"
            [loop]="true"
            (entryFocus)="onEntryFocus($event)"
            rdxRovingFocusGroup
        >
            <button
                class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                rdxRovingFocusItem
                tabStopId="item1"
            >
                Item 1
            </button>
            <button
                class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                rdxRovingFocusItem
                tabStopId="item2"
            >
                Item 2
            </button>
            <button
                class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                rdxRovingFocusItem
                tabStopId="item3"
            >
                Item 3
            </button>
        </div>
    `
})
export class RovingFocusEventsComponent {
    onEntryFocus(event: Event) {
        console.log('Entry focus triggered:', event);
    }

    onTabStopChange(tabStopId: string | null) {
        console.log('Current tab stop changed to:', tabStopId);
    }
}
