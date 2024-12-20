import { Component } from '@angular/core';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { ChevronDown, LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'radix-accordion-demo',
    standalone: true,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective,
        LucideAngularModule
    ],
    template: `
        <div class="AccordionRoot" [defaultValue]="'item-1'" rdxAccordionRoot>
            <div class="AccordionItem" [value]="'item-1'" rdxAccordionItem>
                <div class="AccordionHeader" rdxAccordionHeader>
                    <button class="AccordionTrigger" type="button" rdxAccordionTrigger>
                        Is it accessible?
                        <lucide-angular class="AccordionChevron" [img]="ChevronDownIcon" size="16" />
                    </button>
                </div>
                <div class="AccordionContent" rdxAccordionContent>
                    <div class="AccordionContentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div class="AccordionItem" [value]="'item-2'" rdxAccordionItem>
                <div class="AccordionHeader" rdxAccordionHeader>
                    <button class="AccordionTrigger" type="button" rdxAccordionTrigger>
                        Is it unstyled?
                        <lucide-angular class="AccordionChevron" [img]="ChevronDownIcon" size="16" />
                    </button>
                </div>
                <div class="AccordionContent" rdxAccordionContent>
                    <div class="AccordionContentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div class="AccordionItem" [value]="'item-3'" rdxAccordionItem>
                <div class="AccordionHeader" rdxAccordionHeader>
                    <button class="AccordionTrigger" type="button" rdxAccordionTrigger>
                        Can it be animated?
                        <lucide-angular class="AccordionChevron" [img]="ChevronDownIcon" size="16" />
                    </button>
                </div>
                <div class="AccordionContent" rdxAccordionContent>
                    <div class="AccordionContentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
                </div>
            </div>
        </div>
    `,
    styleUrl: 'accordion-demo.css'
})
export class AccordionDemoComponent {
    readonly ChevronDownIcon = ChevronDown;
    protected readonly XIcon = X;
}

export default AccordionDemoComponent;
