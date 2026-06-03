import { Component } from '@angular/core';
import { LucideChevronDown as ChevronDown, LucideDynamicIcon, LucideX as X } from '@lucide/angular';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    selector: 'radix-accordion-demo',
    standalone: true,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective,
        LucideDynamicIcon
    ],
    template: `
        <div class="AccordionRoot" [defaultValue]="'item-1'" rdxAccordionRoot>
            <div class="AccordionItem" [value]="'item-1'" rdxAccordionItem>
                <div class="AccordionHeader" rdxAccordionHeader>
                    <button class="AccordionTrigger" type="button" rdxAccordionTrigger>
                        Is it accessible?
                        <svg class="AccordionChevron" [lucideIcon]="ChevronDownIcon" size="16" />
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
                        <svg class="AccordionChevron" [lucideIcon]="ChevronDownIcon" size="16" />
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
                        <svg class="AccordionChevron" [lucideIcon]="ChevronDownIcon" size="16" />
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
