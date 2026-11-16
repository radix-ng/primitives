import { Component, computed, signal } from '@angular/core';
import {
    RdxTabsIndicator,
    RdxTabsList,
    RdxTabsRoot,
    RdxTabsTab,
    type RdxTabsValueChangeEvent
} from '@radix-ng/primitives/tabs';
import { config, installProbe } from './contract';
import { indicatorClass, indicatorModel } from './indicator';

@Component({
    selector: 'parity-tabs-indicator',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsIndicator],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <button type="button" data-testid="outside">Outside</button>
        <div
            [value]="model().value"
            [orientation]="model().orientation"
            (onValueChange)="change($event)"
            data-testid="tabs-root"
            rdxTabsRoot
        >
            @for (list of [{ key: model().listKey }]; track list.key) {
                <div [class]="model().listClass" aria-label="Indicator tabs" data-testid="tablist" rdxTabsList>
                    @for (tab of model().tabs; track tab.key) {
                        <button
                            [class]="tab.className"
                            [value]="tab.value"
                            [attr.data-value]="tab.value"
                            [attr.data-testid]="'tab-' + tab.value"
                            rdxTabsTab
                        >
                            {{ tab.label }}
                        </button>
                    }
                    @for (id of model().indicators; track id) {
                        <span [class]="indicatorClass" [attr.data-testid]="'indicator-' + id" rdxTabsIndicator></span>
                    }
                </div>
            }
        </div>
    `
})
export class AngularIndicator {
    readonly settings = config();
    readonly trace = installProbe('angular', this.settings);
    readonly step = signal(0);
    readonly model = computed(() => indicatorModel(this.settings.indicator!, this.step()));
    readonly indicatorClass = indicatorClass;

    change({ value, eventDetails: details }: RdxTabsValueChangeEvent) {
        this.trace.change(
            value,
            details.reason,
            details.activationDirection,
            details.isCanceled(),
            details.event,
            details.trigger
        );
    }

    command(event: KeyboardEvent) {
        if (!['F2', 'F3', 'F4'].includes(event.key)) return;
        event.preventDefault();
        this.step.set(Number(event.key.slice(1)) - 1);
    }
}
