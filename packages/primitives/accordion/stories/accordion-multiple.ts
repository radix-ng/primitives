import { Component } from '@angular/core';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn, demoAccordion } from '../../storybook/styles';

@Component({
    selector: 'accordion-multiple-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div [class]="cn(a.root, 'w-[300px]')" [value]="['item-2', 'item-3']" type="multiple" rdxAccordionRoot>
            <div [class]="a.item" [value]="'item-1'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div [class]="a.item" [value]="'item-2'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div [class]="a.item" [value]="'item-3'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Can it be animated?</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AccordionMultipleExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;
}
