import { cn, demoAccordion, demoInput } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

/**
 * With `keepMounted`, collapsed panels keep their element in the DOM while hidden.
 * Type something below, collapse the panel, and reopen it — the value is retained.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-keep-mounted-example',
    imports: [
        FormsModule,
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div keepMounted rdxAccordionRoot [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'">
            <div rdxAccordionItem [class]="a.item" [value]="'item-1'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Shipping address</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">
                        <input placeholder="Type, then collapse & reopen" [class]="input" [(ngModel)]="address" />
                    </div>
                </div>
            </div>

            <div rdxAccordionItem [class]="a.item" [value]="'item-2'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Billing address</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">Same as shipping.</div>
                </div>
            </div>
        </div>
    `
})
export class AccordionKeepMountedExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;
    protected readonly input = demoInput;

    address = '';
}
