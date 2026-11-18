import { Component, signal } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective,
    RdxAccordionValueChangeEvent
} from '@radix-ng/primitives/accordion';

@Component({
    selector: 'accordion-controlled-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    template: `
        <div class="flex w-[300px] flex-col gap-3">
            <label class="flex items-center gap-2 text-sm" for="accordion-block-changes">
                <input
                    id="accordion-block-changes"
                    [checked]="blocked()"
                    (change)="blocked.set(!blocked())"
                    type="checkbox"
                />
                Block changes
            </label>
            <div
                class="demo-accordion-root overflow-hidden"
                [(value)]="selected"
                (onValueChange)="request($event)"
                rdxAccordionRoot
            >
                @for (item of items; track item) {
                    <div
                        class="border-border focus-within:ring-ring overflow-hidden border-b last:border-b-0 focus-within:relative focus-within:z-[1] focus-within:ring-2 focus-within:outline-none focus-within:ring-inset"
                        [value]="item"
                        rdxAccordionItem
                    >
                        <h3 class="flex" rdxAccordionHeader>
                            <button
                                class="demo-accordion-trigger flex h-12 w-full flex-1 items-center justify-between px-5 aria-disabled:opacity-60"
                                rdxAccordionTrigger
                            >
                                {{ item }}
                            </button>
                        </h3>
                        <div
                            class="demo-accordion-content [&[data-open][data-orientation=vertical]]:animate-accordion-down [&:not([data-open])[data-orientation=vertical]]:animate-accordion-up [&[data-open][data-orientation=horizontal]]:animate-accordion-right [&:not([data-open])[data-orientation=horizontal]]:animate-accordion-left overflow-hidden [&:not([data-open])[data-orientation=horizontal]]:w-0 [&:not([data-open])[data-orientation=vertical]]:h-0"
                            *rdxAccordionPanelPresence
                            rdxAccordionPanel
                        >
                            <div class="px-5 py-4">Content for {{ item }}.</div>
                        </div>
                    </div>
                }
            </div>
            <p class="text-muted-foreground text-sm" data-testid="accordion-value">
                Selected: {{ selected().join(', ') }}
            </p>
            <p class="text-muted-foreground text-sm" data-testid="accordion-requests">Requests: {{ requests() }}</p>
        </div>
    `
})
export class AccordionControlledExample {
    readonly items = ['First', 'Second'];
    readonly selected = signal<unknown[]>(['First']);
    readonly blocked = signal(false);
    readonly requests = signal(0);
    request(event: RdxAccordionValueChangeEvent) {
        this.requests.update((count) => count + 1);
        if (this.blocked()) event.eventDetails.cancel();
    }
}
