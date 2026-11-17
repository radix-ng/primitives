import { Component, signal } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { installProbe, settings } from './contract';
import './motion.css';
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
        <button (click)="tall.set(!tall())" type="button" data-testid="grow">Change content</button>
        <div
            class="motion-root"
            [orientation]="s.motion === 'horizontal' ? 'horizontal' : 'vertical'"
            [defaultValue]="s.motion === 'initial' ? ['a'] : []"
            [hiddenUntilFound]="s.motion === 'search'"
            (onValueChange)="probe.request('root', $event.value, $event.eventDetails)"
            rdxAccordionRoot
        >
            @for (id of ids; track id) {
                <div [value]="id" (onOpenChange)="probe.request(id, $event.open, $event.eventDetails)" rdxAccordionItem>
                    <h3 rdxAccordionHeader>
                        <button [attr.data-testid]="id + '-trigger'" rdxAccordionTrigger>{{ id }}</button>
                    </h3>
                    <div
                        class="motion-panel"
                        *rdxAccordionPanelPresence
                        [attr.data-variant]="s.motion"
                        [attr.data-testid]="id + '-panel'"
                        rdxAccordionPanel
                    >
                        <div class="motion-body" [attr.data-tall]="tall() ? '' : undefined">Content {{ id }}</div>
                    </div>
                </div>
            }
        </div>
    `
})
export class AngularMotionAccordion {
    readonly s = settings();
    readonly probe = installProbe(this.s);
    readonly ids = ['a', 'b'];
    readonly tall = signal(false);
}
