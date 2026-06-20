import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn, demoAccordion } from '../../storybook/styles';

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
            [class]="cn(a.root, 'flex h-[300px] flex-row')"
            [defaultValue]="'item-1'"
            [orientation]="'horizontal'"
            rdxAccordionRoot
        >
            <div [class]="cn(a.item, a.itemH)" [value]="'item-1'" rdxAccordionItem>
                <div [class]="a.header" rdxAccordionHeader>
                    <button [class]="cn(a.trigger, a.triggerH)" type="button" rdxAccordionTrigger>
                        Is it accessible?
                    </button>
                </div>
                <div [class]="a.content" rdxAccordionPanel>
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div [class]="cn(a.item, a.itemH)" [value]="'item-2'" [disabled]="true" rdxAccordionItem>
                <div [class]="a.header" rdxAccordionHeader>
                    <button [class]="cn(a.trigger, a.triggerH)" type="button" rdxAccordionTrigger>
                        Is it unstyled?
                    </button>
                </div>
                <div [class]="a.content" rdxAccordionPanel>
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div [class]="cn(a.item, a.itemH)" [value]="'item-3'" rdxAccordionItem>
                <div [class]="a.header" rdxAccordionHeader>
                    <button [class]="cn(a.trigger, a.triggerH)" type="button" rdxAccordionTrigger>
                        Can it be animated?
                    </button>
                </div>
                <div [class]="a.content" rdxAccordionPanel>
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
