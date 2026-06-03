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
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-horizontal-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div
            rdxAccordionRoot
            [class]="cn(a.root, 'flex h-[300px] flex-row')"
            [defaultValue]="'item-1'"
            [orientation]="'horizontal'"
        >
            <div rdxAccordionItem [class]="cn(a.item, a.itemH)" [value]="'item-1'">
                <div rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="cn(a.trigger, a.triggerH)">
                        Is it accessible?
                    </button>
                </div>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div rdxAccordionItem [class]="cn(a.item, a.itemH)" [value]="'item-2'" [disabled]="true">
                <div rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="cn(a.trigger, a.triggerH)">
                        Is it unstyled?
                    </button>
                </div>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div rdxAccordionItem [class]="cn(a.item, a.itemH)" [value]="'item-3'">
                <div rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="cn(a.trigger, a.triggerH)">
                        Can it be animated?
                    </button>
                </div>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
                </div>
            </div>
        </div>
    `
})
export class AccordionHorizontalExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;
}
