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
    selector: 'radix-accordion-tailwind-demo',
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
        <div class="block w-[220px] sm:w-[280px] lg:w-[350px]" [defaultValue]="'item-1'" rdxAccordionRoot>
            <div class="block border-b" [value]="'item-1'" rdxAccordionItem>
                <h3 class="flex" rdxAccordionHeader>
                    <button
                        class="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Is it accessible?
                        <svg
                            class="group h-4 shrink-0 transition-transform duration-200"
                            [lucideIcon]="ChevronDownIcon"
                            size="16"
                        />
                    </button>
                </h3>
                <div
                    class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all"
                    rdxAccordionContent
                >
                    <div class="pt-0 pb-4">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div class="block border-b" [value]="'item-2'" rdxAccordionItem>
                <h3 class="flex" rdxAccordionHeader>
                    <button
                        class="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Is it unstyled?
                        <svg
                            class="group h-4 shrink-0 transition-transform duration-200"
                            [lucideIcon]="ChevronDownIcon"
                            size="16"
                        />
                    </button>
                </h3>
                <div
                    class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all"
                    rdxAccordionContent
                >
                    <div class="pt-0 pb-4">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div class="block border-b" [value]="'item-3'" rdxAccordionItem>
                <h3 class="flex" rdxAccordionHeader>
                    <button
                        class="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Can it be animated?
                        <svg
                            class="group h-4 shrink-0 transition-transform duration-200"
                            [lucideIcon]="ChevronDownIcon"
                            size="16"
                        />
                    </button>
                </h3>
                <div
                    class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all"
                    rdxAccordionContent
                >
                    <div class="pt-0 pb-4">Yes! You can animate the Accordion with CSS or JavaScript.</div>
                </div>
            </div>
        </div>
    `
})
export class AccordionDemoComponent {
    readonly ChevronDownIcon = ChevronDown;
    protected readonly XIcon = X;
}

export default AccordionDemoComponent;
