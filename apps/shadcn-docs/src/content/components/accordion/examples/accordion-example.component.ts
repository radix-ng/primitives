import { Component } from '@angular/core';
import {
    ShAccordionComponent,
    ShAccordionContentComponent,
    ShAccordionItemComponent,
    ShAccordionTriggerComponent
} from '@radix-ng/shadcn/accordion';

@Component({
    standalone: true,
    imports: [
        ShAccordionItemComponent,
        ShAccordionTriggerComponent,
        ShAccordionContentComponent,
        ShAccordionComponent
    ],
    template: `
        <shAccordion class="w-full">
            <shAccordionItem value="item-1">
                <shAccordionTrigger>Is it accessible?</shAccordionTrigger>
                <div shAccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</div>
            </shAccordionItem>

            <shAccordionItem value="item-2">
                <shAccordionTrigger>Is it styled?</shAccordionTrigger>
                <div shAccordionContent>
                    Yes. It comes with default styles that matches the other components' aesthetic.
                </div>
            </shAccordionItem>

            <shAccordionItem value="item-3">
                <shAccordionTrigger>Can it be animated?</shAccordionTrigger>
                <div shAccordionContent>Yes! You can animate the Accordion with CSS or JavaScript.</div>
            </shAccordionItem>
        </shAccordion>
    `
})
export class AccordionExampleComponent {}
