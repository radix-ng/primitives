import { Component, computed, input } from '@angular/core';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';
import { LucideAngularModule } from 'lucide-angular';

const accordionItemVariant = cva('border-b block');
@Component({
    selector: 'shAccordionItem',
    standalone: true,
    template: '<ng-content></ng-content>',
    hostDirectives: [{ directive: RdxAccordionItemDirective, inputs: ['value'] }],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShAccordionItemComponent {
    readonly value = input<string>;
    readonly class = input<string>();
    protected computedClass = computed(() => cn(accordionItemVariant({ class: this.class() })));
}

const accordionTriggerVariants = cva(
    'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>lucide-angular]:rotate-180'
);
@Component({
    selector: 'shAccordionTrigger',
    standalone: true,
    hostDirectives: [RdxAccordionTriggerDirective],
    template: `
        <h3 class="flex" rdxAccordionHeader>
            <button [class]="computedClass()" type="button">
                <ng-content></ng-content>
                <lucide-angular
                    class="group h-4 shrink-0 transition-transform duration-200"
                    name="chevron-down"
                ></lucide-angular>
            </button>
        </h3>
    `,
    host: {
        class: 'w-full'
    },
    imports: [RdxAccordionHeaderDirective, RdxAccordionTriggerDirective, LucideAngularModule]
})
export class ShAccordionTriggerComponent {
    readonly class = input<string>();
    protected computedClass = computed(() => cn(accordionTriggerVariants({ class: this.class() })));
}

@Component({
    selector: '[shAccordionContent]',
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

const accordionVariant = cva('block');
@Component({
    selector: 'shAccordion',
    standalone: true,
    hostDirectives: [RdxAccordionRootDirective],
    host: {
        '[class]': 'computedClass()'
    },
    template: `
        <ng-content></ng-content>
    `
})
export class ShAccordionComponent {
    readonly class = input<string>();
    protected computedClass = computed(() => cn(accordionVariant({ class: this.class() })));
}
