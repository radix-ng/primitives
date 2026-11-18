import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    selector: 'accordion-collapsible-array-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="demo-accordion-root w-[300px] overflow-hidden" [defaultValue]="['item-1']" rdxAccordionRoot>
            @for (item of items; track item.id) {
                <div
                    class="border-border focus-within:ring-ring overflow-hidden border-b last:border-b-0 focus-within:relative focus-within:z-[1] focus-within:ring-2 focus-within:outline-none focus-within:ring-inset"
                    [value]="item.id"
                    rdxAccordionItem
                >
                    <h3 class="flex" rdxAccordionHeader>
                        <button
                            class="demo-accordion-trigger flex h-12 w-full flex-1 items-center justify-between px-5 aria-disabled:opacity-60"
                            type="button"
                            rdxAccordionTrigger
                        >
                            {{ item.title }}
                        </button>
                    </h3>
                    <div
                        class="demo-accordion-content [&[data-open][data-orientation=vertical]]:animate-accordion-down [&:not([data-open])[data-orientation=vertical]]:animate-accordion-up [&[data-open][data-orientation=horizontal]]:animate-accordion-right [&:not([data-open])[data-orientation=horizontal]]:animate-accordion-left overflow-hidden [&:not([data-open])[data-orientation=horizontal]]:w-0 [&:not([data-open])[data-orientation=vertical]]:h-0"
                        *rdxAccordionPanelPresence
                        rdxAccordionPanel
                    >
                        <div class="px-5 py-4">{{ item.content }}</div>
                    </div>
                </div>
            }
        </div>
    `
})
export class AccordionCollapsibleArrayExample {
    readonly items = [
        { id: 'item-1', title: 'Is it accessible?', content: 'Yes. It adheres to the WAI-ARIA design pattern.' },
        {
            id: 'item-2',
            title: 'Is it unstyled?',
            content: "Yes. It's unstyled by default, giving you freedom over the look and feel."
        },
        {
            id: 'item-3',
            title: 'Can it be animated?',
            content: 'Yes! You can animate the Accordion with CSS or JavaScript.'
        }
    ];
}
