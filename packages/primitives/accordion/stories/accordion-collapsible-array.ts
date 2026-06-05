import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn, demoAccordion } from '../../storybook/styles';

@Component({
    selector: 'accordion-collapsible-array-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'" collapsible rdxAccordionRoot>
            @for (item of items; track item.id) {
                <div [class]="a.item" [value]="item.id" rdxAccordionItem>
                    <h3 [class]="a.header" rdxAccordionHeader>
                        <button [class]="a.trigger" type="button" rdxAccordionTrigger>{{ item.title }}</button>
                    </h3>
                    <div [class]="a.content" rdxAccordionContent>
                        <div [class]="a.contentText">{{ item.content }}</div>
                    </div>
                </div>
            }
        </div>
    `
})
export class AccordionCollapsibleArrayExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;

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
