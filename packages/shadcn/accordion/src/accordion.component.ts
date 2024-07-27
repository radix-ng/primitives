import { Component, computed, Directive, input } from '@angular/core';

import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';
import { LucideAngularModule } from 'lucide-angular';

const accordionItemVariant = cva('border-b');
@Directive({
    selector: '[shAccordionItem]',
    standalone: true,
    hostDirectives: [{ directive: RdxAccordionItemDirective, inputs: ['value: shValue'] }],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShAccordionItemDirective {
    readonly shValue = input<string>;
    readonly class = input<string>();
    protected computedClass = computed(() => cn(accordionItemVariant({ class: this.class() })));
}

const accordionTriggerVariants = cva(
    'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>lucide-angular]:rotate-180'
);
@Component({
    selector: 'sh-accordion-trigger',
    standalone: true,
    template: `
        <h3 rdxAccordionHeader class="flex">
            <button rdxAccordionTrigger type="button" [class]="computedClass()">
                <ng-content></ng-content>
                <lucide-angular
                    name="chevron-down"
                    class="group h-4 shrink-0 transition-transform duration-200"
                ></lucide-angular>
            </button>
        </h3>
    `,
    imports: [RdxAccordionHeaderDirective, RdxAccordionTriggerDirective, LucideAngularModule]
})
export class ShAccordionTriggerComponent {
    readonly class = input<string>();
    protected computedClass = computed(() => cn(accordionTriggerVariants({ class: this.class() })));
}

@Component({
    selector: '[sh-accordion-content]',
    standalone: true,
    hostDirectives: [RdxAccordionContentDirective],
    host: {
        '[class]':
            '"overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"'
    },
    template: `
        <div class="pb-4 pt-0"><ng-content></ng-content></div>
    `
})
export class ShAccordionContentComponent {}
