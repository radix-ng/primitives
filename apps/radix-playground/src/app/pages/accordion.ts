import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { DemoPage } from '../shared/demo-page';
import { cn, demoAccordion } from '../shared/styles';

@Component({
    selector: 'app-accordion',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DemoPage,
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <demo-page
            title="Accordion"
            description="A vertically stacked set of interactive headings that each reveal a section of content."
        >
            <div [class]="cn(a.root, 'w-[360px]')" [defaultValue]="'item-1'" rdxAccordionRoot>
                <div [class]="a.item" [value]="'item-1'" rdxAccordionItem>
                    <h3 [class]="a.header" rdxAccordionHeader>
                        <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                    </h3>
                    <div [class]="a.content" rdxAccordionPanel>
                        <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                    </div>
                </div>
                <div [class]="a.item" [value]="'item-2'" rdxAccordionItem>
                    <h3 [class]="a.header" rdxAccordionHeader>
                        <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                    </h3>
                    <div [class]="a.content" rdxAccordionPanel>
                        <div [class]="a.contentText">
                            Yes. It's unstyled by default, giving you freedom over the look and feel.
                        </div>
                    </div>
                </div>
                <div [class]="a.item" [value]="'item-3'" rdxAccordionItem>
                    <h3 [class]="a.header" rdxAccordionHeader>
                        <button [class]="a.trigger" type="button" rdxAccordionTrigger>Can it be animated?</button>
                    </h3>
                    <div [class]="a.content" rdxAccordionPanel>
                        <div [class]="a.contentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
                    </div>
                </div>
            </div>
        </demo-page>
    `
})
export default class AccordionPage {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;
}
