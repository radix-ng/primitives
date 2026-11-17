import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { installProbe, settings } from './contract';

@Component({
    selector: 'lifecycle-child',
    template: '<input aria-label="Panel input" value="initial" />'
})
class LifecycleChild {
    constructor() {
        window.accordionParity.children.created++;
        inject(DestroyRef).onDestroy(() => window.accordionParity.children.destroyed++);
    }
}
@Component({
    selector: 'parity-accordion',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective,
        LifecycleChild
    ],
    template: `
        <button (click)="overridden.set(!overridden())" type="button" data-testid="override">Toggle override</button>
        <button (click)="keep.set(!keep())" type="button" data-testid="keep">Toggle retention</button>
        <button (click)="show.set(false)" type="button" data-testid="remove-root">Remove Root</button>
        <button (click)="ids.set(['b', 'a'])" type="button" data-testid="reorder">Reorder</button>
        <button (click)="ids.set(['b'])" type="button" data-testid="remove-a">Remove A</button>
        <button (click)="showPanel.set(!showPanel())" type="button" data-testid="toggle-panel">Toggle Panel</button>
        @if (show()) {
            <div
                [keepMounted]="keep()"
                [hiddenUntilFound]="mode === 'search'"
                [defaultValue]="mode === 'reorder' || mode === 'conditional' ? ['a'] : []"
                (onValueChange)="probe.request('root', $event.value, $event.eventDetails)"
                rdxAccordionRoot
            >
                @for (id of ids(); track id) {
                    <div
                        [value]="id"
                        (onOpenChange)="probe.request(id, $event.open, $event.eventDetails)"
                        rdxAccordionItem
                    >
                        <h3 rdxAccordionHeader>
                            <button [attr.data-testid]="id + '-trigger'" rdxAccordionTrigger>{{ id }}</button>
                        </h3>
                        @if (showPanel()) {
                            <div
                                *rdxAccordionPanelPresence="{ keepMounted: overridden() ? false : undefined }"
                                [attr.data-testid]="id + '-panel'"
                                rdxAccordionPanel
                            >
                                <lifecycle-child />
                            </div>
                        }
                    </div>
                }
            </div>
        }
    `
})
export class AngularLifecycleAccordion {
    readonly s = settings();
    readonly mode = this.s.lifetime;
    readonly probe = installProbe(this.s);
    readonly ids = signal(['a', 'b']);
    readonly keep = signal(this.mode === 'retain' || this.mode === 'override');
    readonly overridden = signal(this.mode === 'override');
    readonly show = signal(true);
    readonly showPanel = signal(true);
}
