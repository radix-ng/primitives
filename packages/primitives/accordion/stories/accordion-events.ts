import { cn, demoAccordion } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-events-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div class="flex w-[300px] flex-col gap-3">
            <div rdxAccordionRoot [class]="a.root" [defaultValue]="'item-1'">
                <div rdxAccordionItem [class]="a.item" [value]="'item-1'" (onOpenChange)="log('Accessibility', $event)">
                    <h3 rdxAccordionHeader [class]="a.header">
                        <button type="button" rdxAccordionTrigger [class]="a.trigger">Is it accessible?</button>
                    </h3>
                    <div rdxAccordionPanel [class]="a.content">
                        <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                    </div>
                </div>

                <div rdxAccordionItem [class]="a.item" [value]="'item-2'" (onOpenChange)="log('Styling', $event)">
                    <h3 rdxAccordionHeader [class]="a.header">
                        <button type="button" rdxAccordionTrigger [class]="a.trigger">Is it unstyled?</button>
                    </h3>
                    <div rdxAccordionPanel [class]="a.content">
                        <div [class]="a.contentText">Yes. It's unstyled by default.</div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">Last event: {{ status() }}</p>
        </div>
    `
})
export class AccordionEventsExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;

    readonly status = signal('—');

    log(title: string, event: { open: boolean }): void {
        this.status.set(`${title} ${event.open ? 'opened' : 'closed'}`);
    }
}
