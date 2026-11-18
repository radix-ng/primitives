import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

/**
 * With `keepMounted`, collapsed panels keep their element in the DOM while hidden.
 * Type something below, collapse the panel, and reopen it — the value is retained.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-keep-mounted-example',
    imports: [
        FormsModule,
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    template: `
        <div
            class="demo-accordion-root w-[300px] overflow-hidden"
            [defaultValue]="['item-1']"
            keepMounted
            rdxAccordionRoot
        >
            <div
                class="border-border focus-within:ring-ring overflow-hidden border-b last:border-b-0 focus-within:relative focus-within:z-[1] focus-within:ring-2 focus-within:outline-none focus-within:ring-inset"
                [value]="'item-1'"
                rdxAccordionItem
            >
                <h3 class="flex" rdxAccordionHeader>
                    <button
                        class="demo-accordion-trigger flex h-12 w-full flex-1 items-center justify-between px-5 aria-disabled:opacity-60"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Shipping address
                    </button>
                </h3>
                <div
                    class="demo-accordion-content [&[data-open][data-orientation=vertical]]:animate-accordion-down [&:not([data-open])[data-orientation=vertical]]:animate-accordion-up [&[data-open][data-orientation=horizontal]]:animate-accordion-right [&:not([data-open])[data-orientation=horizontal]]:animate-accordion-left overflow-hidden [&:not([data-open])[data-orientation=horizontal]]:w-0 [&:not([data-open])[data-orientation=vertical]]:h-0"
                    *rdxAccordionPanelPresence
                    rdxAccordionPanel
                >
                    <div class="px-5 py-4">
                        <input
                            class="demo-input h-9 w-full px-3"
                            [(ngModel)]="address"
                            placeholder="Type, then collapse & reopen"
                        />
                    </div>
                </div>
            </div>

            <div
                class="border-border focus-within:ring-ring overflow-hidden border-b last:border-b-0 focus-within:relative focus-within:z-[1] focus-within:ring-2 focus-within:outline-none focus-within:ring-inset"
                [value]="'item-2'"
                rdxAccordionItem
            >
                <h3 class="flex" rdxAccordionHeader>
                    <button
                        class="demo-accordion-trigger flex h-12 w-full flex-1 items-center justify-between px-5 aria-disabled:opacity-60"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Billing address
                    </button>
                </h3>
                <div
                    class="demo-accordion-content [&[data-open][data-orientation=vertical]]:animate-accordion-down [&:not([data-open])[data-orientation=vertical]]:animate-accordion-up [&[data-open][data-orientation=horizontal]]:animate-accordion-right [&:not([data-open])[data-orientation=horizontal]]:animate-accordion-left overflow-hidden [&:not([data-open])[data-orientation=horizontal]]:w-0 [&:not([data-open])[data-orientation=vertical]]:h-0"
                    *rdxAccordionPanelPresence
                    rdxAccordionPanel
                >
                    <div class="px-5 py-4">Same as shipping.</div>
                </div>
            </div>
        </div>
    `
})
export class AccordionKeepMountedExample {
    address = '';
}
