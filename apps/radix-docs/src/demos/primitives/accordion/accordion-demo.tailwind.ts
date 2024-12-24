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
    selector: 'radix-accordion-tailwind-demo',
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
        <div class="block w-[220px] sm:w-[280px] lg:w-[350px]" [defaultValue]="'item-1'" rdxAccordionRoot>
            <div class="block border-b" [value]="'item-1'" rdxAccordionItem>
                <div class="flex" rdxAccordionHeader>
                    <button
                        class="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>lucide-angular]:rotate-180"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Is it accessible?
                        <lucide-angular
                            class="group h-4 shrink-0 transition-transform duration-200"
                            [img]="ChevronDownIcon"
                            size="16"
                        />
                    </button>
                </div>
                <div
                    class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all"
                    rdxAccordionContent
                >
                    <div class="pb-4 pt-0">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div class="block border-b" [value]="'item-2'" rdxAccordionItem>
                <div class="flex" rdxAccordionHeader>
                    <button
                        class="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>lucide-angular]:rotate-180"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Is it unstyled?
                        <lucide-angular
                            class="group h-4 shrink-0 transition-transform duration-200"
                            [img]="ChevronDownIcon"
                            size="16"
                        />
                    </button>
                </div>
                <div
                    class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all"
                    rdxAccordionContent
                >
                    <div class="pb-4 pt-0">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div class="block border-b" [value]="'item-3'" rdxAccordionItem>
                <div class="flex" rdxAccordionHeader>
                    <button
                        class="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>lucide-angular]:rotate-180"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Can it be animated?
                        <lucide-angular
                            class="group h-4 shrink-0 transition-transform duration-200"
                            [img]="ChevronDownIcon"
                            size="16"
                        />
                    </button>
                </div>
                <div
                    class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all"
                    rdxAccordionContent
                >
                    <div class="pb-4 pt-0">Yes! You can animate the Accordion with CSS or JavaScript.</div>
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
