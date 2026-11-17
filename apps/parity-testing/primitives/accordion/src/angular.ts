import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { installProbe, settings } from './contract';
import { AngularLifecycleAccordion } from './lifecycle.angular';

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
        <button data-testid="before" type="button" tabindex="0">Before</button>
        <form (submit)="probe.submit($event)">
            <div
                [value]="s.controlled ? (s.initial ?? []) : undefined"
                [defaultValue]="s.defaults"
                [multiple]="s.multiple ?? false"
                [disabled]="s.disabled === 'root'"
                [hiddenUntilFound]="s.reveal ?? false"
                (onValueChange)="probe.request('root', $event.value, $event.eventDetails)"
                rdxAccordionRoot
                keepMounted
            >
                @for (id of ids; track id) {
                    <div
                        [value]="id"
                        [disabled]="s.disabled === 'item'"
                        [attr.data-testid]="id + '-item'"
                        (onOpenChange)="probe.request(id, $event.open, $event.eventDetails)"
                        rdxAccordionItem
                    >
                        <h3 [attr.data-testid]="id + '-header'" rdxAccordionHeader>
                            @if (s.span) {
                                <!-- Button supplies keyboard activation for the custom host. -->
                                <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
                                <span
                                    [disabled]="s.disabled === 'trigger'"
                                    [attr.data-testid]="id + '-trigger'"
                                    (click)="probe.click($event)"
                                    rdxAccordionTrigger
                                >
                                    {{ id }}
                                </span>
                            } @else {
                                <button
                                    [disabled]="s.disabled === 'trigger'"
                                    [type]="s.submit ? 'submit' : 'button'"
                                    [id]="s.authored ? id + '-authored-trigger' : undefined"
                                    [attr.data-testid]="id + '-trigger'"
                                    (click)="probe.click($event)"
                                    rdxAccordionTrigger
                                >
                                    {{ id }}
                                </button>
                            }
                        </h3>
                        <div
                            *rdxAccordionPanelPresence
                            [id]="s.authored ? id + '-authored-panel' : undefined"
                            [attr.data-testid]="id + '-panel'"
                            rdxAccordionPanel
                        >
                            Content {{ id }}
                        </div>
                    </div>
                }
            </div>
        </form>
        <button data-testid="after" type="button" tabindex="0">After</button>
    `
})
class AngularAccordion {
    readonly s = settings();
    readonly ids = ['a', 'b'];
    readonly probe = installProbe(this.s);
}
void bootstrapApplication(settings().lifetime ? AngularLifecycleAccordion : AngularAccordion, {
    providers: [provideZonelessChangeDetection()]
});
