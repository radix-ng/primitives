import { Component } from '@angular/core';

import { RdxAccordionRootDirective } from '@radix-ng/primitives/accordion';
import {
    ShAccordionContent,
    ShAccordionItemDirective,
    ShAccordionTrigger
} from '@radix-ng/shadcn/accordion';

@Component({
    standalone: true,
    imports: [
        RdxAccordionRootDirective,
        ShAccordionItemDirective,
        ShAccordionTrigger,
        ShAccordionContent
    ],
    template: `
        <div AccordionRoot class="w-full">
            <div shAccordionItem shValue="item-1">
                <sh-accordion-trigger>Is it accessible?</sh-accordion-trigger>
                <div sh-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</div>
            </div>

            <div shAccordionItem shValue="item-2">
                <sh-accordion-trigger>Is it styled?</sh-accordion-trigger>
                <div sh-accordion-content>
                    Yes. It comes with default styles that matches the other components' aesthetic.
                </div>
            </div>

            <div shAccordionItem shValue="item-3">
                <sh-accordion-trigger>Can it be animated?</sh-accordion-trigger>
                <div sh-accordion-content>
                    Yes! You can animate the Accordion with CSS or JavaScript.
                </div>
            </div>
        </div>
    `
})
export class AccordionExampleComponent {}
