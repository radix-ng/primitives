import { cn, demoAccordion } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    selector: 'accordion-collapsible-array-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div rdxAccordionRoot [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'">
            @for (item of items; track item.id) {
                <div rdxAccordionItem [class]="a.item" [value]="item.id">
                    <h3 rdxAccordionHeader [class]="a.header">
                        <button type="button" rdxAccordionTrigger [class]="a.trigger">{{ item.title }}</button>
                    </h3>
                    <div rdxAccordionPanel [class]="a.content">
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
