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
import { frozenSelection, identityValues } from './identity.contract';

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
        @for (action of actions; track action) {
            <button [attr.data-testid]="action" (click)="perform(action)" type="button">{{ action }}</button>
        }
        <div
            #root="rdxAccordionRoot"
            [multiple]="multiple()"
            [value]="s.identity === 'controlled' ? controlled() : undefined"
            [defaultValue]="values.initial"
            (onValueChange)="request($event)"
            rdxAccordionRoot
            data-testid="identity-root"
            keepMounted
        >
            <output data-testid="selection">{{ serialize(root.value()) }}</output>
            @for (row of rows(); track row.id) {
                <div
                    [value]="row.value"
                    [attr.data-testid]="row.id + '-item'"
                    (onOpenChange)="probe.request(row.id, $event.open, $event.eventDetails)"
                    rdxAccordionItem
                >
                    <h3 [attr.data-testid]="row.id + '-header'" rdxAccordionHeader>
                        <button [attr.data-testid]="row.id + '-trigger'" rdxAccordionTrigger>{{ row.id }}</button>
                    </h3>
                    <div *rdxAccordionPanelPresence [attr.data-testid]="row.id + '-panel'" rdxAccordionPanel>
                        <input [attr.aria-label]="row.id + ' content'" value="initial" />
                    </div>
                </div>
            }
            @if (s.identity === 'fallback') {
                <div
                    (onOpenChange)="probe.request('c', $event.open, $event.eventDetails)"
                    rdxAccordionItem
                    data-testid="c-item"
                >
                    <h3 rdxAccordionHeader data-testid="c-header">
                        <button rdxAccordionTrigger data-testid="c-trigger">c</button>
                    </h3>
                    <div *rdxAccordionPanelPresence rdxAccordionPanel data-testid="c-panel">
                        <input aria-label="c content" value="initial" />
                    </div>
                </div>
            }
        </div>
    `
})
export class AngularIdentityAccordion {
    readonly s = settings();
    readonly probe = installProbe(this.s);
    readonly values = identityValues(this.s.identity!, this.s.multiple ?? false);
    readonly rows = signal(this.values.rows);
    readonly multiple = signal(this.s.multiple ?? false);
    readonly controlled = signal(this.values.initial);
    private readonly accept = signal(false);
    readonly actions = [
        'reorder',
        'insert',
        'remove-a',
        'return-a',
        'replace-a',
        'restore-a',
        'external-orphan',
        'external-clear',
        'accept',
        'toggle-multiple'
    ];
    readonly serialize = (values: unknown[]) => JSON.stringify(this.values.labels(values));

    request(event: RdxAccordionValueChangeEvent) {
        if (this.probe.request('root', this.values.labels(event.value), event.eventDetails) && this.accept()) {
            this.controlled.set(frozenSelection([...event.value]));
        }
    }

    perform(action: string) {
        switch (action) {
            case 'reorder':
                this.rows.update((rows) => [...rows].reverse());
                break;
            case 'insert':
                this.rows.update((rows) => [this.values.row('c'), ...rows]);
                break;
            case 'remove-a':
                this.rows.update((rows) => rows.filter((row) => row.id !== 'a'));
                break;
            case 'return-a':
                this.rows.update((rows) => [...rows, this.values.row('a')]);
                break;
            case 'replace-a':
                this.rows.update((rows) =>
                    rows.map((row) => (row.id === 'a' ? { ...row, value: this.values.replacement } : row))
                );
                break;
            case 'restore-a':
                this.rows.update((rows) => rows.map((row) => (row.id === 'a' ? this.values.row('a') : row)));
                break;
            case 'external-orphan':
                this.controlled.set(frozenSelection([this.values.orphan]));
                break;
            case 'external-clear':
                this.controlled.set(frozenSelection([]));
                break;
            case 'accept':
                this.accept.set(true);
                break;
            case 'toggle-multiple':
                this.multiple.update((multiple) => !multiple);
                break;
            default:
                throw new Error(`Unknown identity action: ${action}`);
        }
    }
}
