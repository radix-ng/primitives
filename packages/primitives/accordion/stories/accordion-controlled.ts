import { Component, signal } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective,
    RdxAccordionValueChangeEvent
} from '@radix-ng/primitives/accordion';
import { demoAccordion } from '../../storybook/styles';

@Component({
    selector: 'accordion-controlled-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    template: `
        <div class="flex w-[300px] flex-col gap-3">
            <label class="flex items-center gap-2 text-sm" for="accordion-block-changes">
                <input
                    id="accordion-block-changes"
                    [checked]="blocked()"
                    (change)="blocked.set(!blocked())"
                    type="checkbox"
                />
                Block changes
            </label>
            <div [(value)]="selected" [class]="a.root" (onValueChange)="request($event)" rdxAccordionRoot>
                @for (item of items; track item) {
                    <div [class]="a.item" [value]="item" rdxAccordionItem>
                        <h3 [class]="a.header" rdxAccordionHeader>
                            <button [class]="a.trigger" rdxAccordionTrigger>{{ item }}</button>
                        </h3>
                        <div *rdxAccordionPanelPresence [class]="a.content" rdxAccordionPanel>
                            <div [class]="a.contentText">Content for {{ item }}.</div>
                        </div>
                    </div>
                }
            </div>
            <p class="text-muted-foreground text-sm" data-testid="accordion-value">
                Selected: {{ selected().join(', ') }}
            </p>
            <p class="text-muted-foreground text-sm" data-testid="accordion-requests">Requests: {{ requests() }}</p>
        </div>
    `
})
export class AccordionControlledExample {
    protected readonly a = demoAccordion;
    readonly items = ['First', 'Second'];
    readonly selected = signal<unknown[]>(['First']);
    readonly blocked = signal(false);
    readonly requests = signal(0);
    request(event: RdxAccordionValueChangeEvent) {
        this.requests.update((count) => count + 1);
        if (this.blocked()) event.eventDetails.cancel();
    }
}
