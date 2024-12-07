import { Component } from '@angular/core';
import { RdxRovingFocusGroupDirective, RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';

@Component({
    selector: 'rvg-events',
    standalone: true,
    imports: [RdxRovingFocusItemDirective, RdxRovingFocusGroupDirective],
    template: `
        <div
            [orientation]="'horizontal'"
            [loop]="true"
            (entryFocus)="onEntryFocus($event)"
            (currentTabStopIdChange)="onTabStopChange($event)"
            rdxRovingFocusGroup
        >
            <button rdxRovingFocusItem tabStopId="item1">Item 1</button>
            <button rdxRovingFocusItem tabStopId="item2">Item 2</button>
            <button rdxRovingFocusItem tabStopId="item3">Item 3</button>
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
