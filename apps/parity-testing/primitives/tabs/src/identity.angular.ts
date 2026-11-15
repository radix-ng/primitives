import { Component, signal } from '@angular/core';
import {
    RdxTabsIndicator,
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsPanelPresence,
    RdxTabsRoot,
    RdxTabsTab,
    RdxTabsValueChangeEvent
} from '@radix-ng/primitives/tabs';
import { classes, config, installProbe, type Value } from './contract';
import { identityCommand, identityParts } from './identity';

@Component({
    selector: 'parity-tabs-identity',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence, RdxTabsIndicator],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <button type="button" data-testid="outside">Outside</button>
        @for (root of roots; track root) {
            <div [class]="s.root" [attr.data-identity-root]="root" [attr.data-testid]="'root-' + root">
                <div [value]="values()[root]" (onValueChange)="change(root, $event)" rdxTabsRoot>
                    <div class="relative flex gap-2" aria-label="Identity tabs" rdxTabsList>
                        @for (tab of tabs(); track tab.key) {
                            <button
                                [class]="s.tab"
                                [value]="tab.value"
                                [id]="tab.id ? root + '-' + tab.id : undefined"
                                [attr.data-part-key]="tab.key"
                                [attr.data-value]="encode(tab.value)"
                                [attr.data-testid]="root + '-tab-' + tab.key"
                                rdxTabsTab
                            >
                                {{ root }} {{ tab.key }}
                            </button>
                        }
                        @if (kind === 'indicator') {
                            <span
                                class="pointer-events-none absolute"
                                [attr.data-testid]="root + '-indicator'"
                                rdxTabsIndicator
                            ></span>
                        }
                    </div>
                    @for (panel of panels(); track panel.key) {
                        <div
                            [class]="s.panel"
                            [value]="panel.value"
                            [id]="panel.id ? root + '-' + panel.id : undefined"
                            [keepMounted]="kind !== 'presence'"
                            [attr.data-part-key]="panel.key"
                            [attr.data-value]="encode(panel.value)"
                            [attr.data-testid]="root + '-panel-' + panel.key"
                            rdxTabsPanel
                        >
                            @if (kind === 'presence') {
                                <div *rdxTabsPanelPresence [attr.data-testid]="root + '-content-' + panel.key">
                                    {{ panel.key }} content
                                </div>
                            } @else {
                                {{ panel.key }} content
                            }
                        </div>
                    }
                </div>
            </div>
        }
    `
})
export class AngularIdentity {
    readonly settings = config();
    readonly kind = this.settings.identity!;
    readonly roots = this.kind === 'roots' ? ['a', 'b'] : ['a'];
    readonly initial = identityParts(this.kind);
    readonly tabs = signal(this.initial.tabs);
    readonly panels = signal(this.initial.panels);
    readonly values = signal<Record<string, Value>>({ a: this.kind === 'mixed-values' ? 1 : 0, b: 0 });
    readonly trace = installProbe('angular', this.settings);
    readonly s = classes;
    readonly encode = (value: Value) => JSON.stringify(value);
    command(event: KeyboardEvent) {
        if (event.key !== 'F2' && event.key !== 'F3') return;
        event.preventDefault();
        const next = identityCommand(this.kind, event.key, this.tabs(), this.panels());
        this.tabs.set(next.tabs);
        this.panels.set(next.panels);
    }
    change(root: string, { value, eventDetails: details }: RdxTabsValueChangeEvent) {
        this.trace.change(
            value,
            details.reason,
            details.activationDirection,
            details.isCanceled(),
            details.event,
            details.trigger
        );
        if (!details.isCanceled()) this.values.update((values) => ({ ...values, [root]: value }));
    }
}
