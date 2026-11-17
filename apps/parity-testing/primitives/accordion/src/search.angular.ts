import { Component, signal } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective,
    type RdxAccordionValueChangeEvent
} from '@radix-ng/primitives/accordion';
import { installProbe, settings } from './contract';
import './search.css';

@Component({
    selector: 'parity-accordion',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    template: `
        <button (click)="allowRequests()" data-testid="allow" type="button">Accept later requests</button>
        <div class="search-spacer"></div>
        <div
            [value]="s.controlled ? value() : undefined"
            (onValueChange)="request($event)"
            rdxAccordionRoot
            hiddenUntilFound
        >
            @for (id of ids; track id) {
                <div [value]="id" (onOpenChange)="probe.request(id, $event.open, $event.eventDetails)" rdxAccordionItem>
                    <h3 rdxAccordionHeader>
                        <button [attr.data-testid]="id + '-trigger'" rdxAccordionTrigger>{{ id }}</button>
                    </h3>
                    <div
                        class="search-panel"
                        *rdxAccordionPanelPresence
                        [attr.data-motion]="s.search?.motion"
                        [attr.data-testid]="id + '-panel'"
                        rdxAccordionPanel
                    >
                        <div class="search-body">
                            <span [id]="id + '-match'">Accordion search needle {{ id }}</span>
                            <input [attr.data-testid]="id + '-input'" aria-label="Retained value" value="initial" />
                        </div>
                    </div>
                </div>
            }
        </div>
        <div class="search-spacer"></div>
    `
})
export class AngularSearchAccordion {
    readonly s = settings();
    readonly probe = installProbe(this.s);
    readonly ids = ['a', 'b'];
    readonly value = signal<unknown[]>([]);
    readonly accept = signal(this.s.acceptControlled ?? false);

    request(event: RdxAccordionValueChangeEvent) {
        if (this.probe.request('root', event.value, event.eventDetails) && this.accept()) {
            this.value.set(event.value);
        }
    }

    allowRequests() {
        this.s.veto = undefined;
        this.accept.set(true);
    }
}
