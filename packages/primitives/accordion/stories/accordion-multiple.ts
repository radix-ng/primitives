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
    selector: 'accordion-multiple-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div multiple rdxAccordionRoot [class]="cn(a.root, 'w-[300px]')" [value]="['item-2', 'item-3']">
            <div rdxAccordionItem [class]="a.item" [value]="'item-1'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Is it accessible?</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div rdxAccordionItem [class]="a.item" [value]="'item-2'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Is it unstyled?</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div rdxAccordionItem [class]="a.item" [value]="'item-3'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Can it be animated?</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
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
