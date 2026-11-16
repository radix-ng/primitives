import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
    RdxTabsIndicator,
    RdxTabsList,
    RdxTabsRoot,
    RdxTabsTab,
    type RdxTabsValueChangeEvent
} from '@radix-ng/primitives/tabs';
import { config, installProbe } from './contract';
import { geometryModel } from './geometry';
import { indicatorClass } from './indicator';

@Component({
    selector: 'parity-tabs-geometry',
    imports: [NgTemplateOutlet, RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsIndicator],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <button type="button" data-testid="outside">Outside</button>
        <div
            [class]="model().frameClass"
            [value]="model().value"
            [orientation]="model().orientation"
            [attr.dir]="model().dir"
            (onValueChange)="change($event)"
            data-testid="tabs-root"
            rdxTabsRoot
        >
            <ng-template #tabs>
                @for (tab of model().tabs; track tab.value) {
                    <span class="inline-flex shrink-0 items-start" [attr.data-testid]="'slot-' + tab.value">
                        <button
                            [class]="tab.className"
                            [value]="tab.value"
                            [attr.data-value]="tab.value"
                            [attr.data-testid]="'tab-' + tab.value"
                            rdxTabsTab
                        >
                            Tab {{ tab.value }}
                        </button>
                    </span>
                }
            </ng-template>
            <div [class]="model().listClass" data-testid="tablist" aria-label="Indicator geometry" rdxTabsList>
                @if (model().wrapperClass) {
                    <div [class]="model().wrapperClass" data-testid="inner">
                        <div [class]="model().rowClass"><ng-container [ngTemplateOutlet]="tabs" /></div>
                    </div>
                } @else {
                    <ng-container [ngTemplateOutlet]="tabs" />
                }
                <span [class]="indicatorClass" data-testid="indicator" rdxTabsIndicator></span>
            </div>
        </div>
    `
})
export class AngularGeometry {
    readonly settings = config();
    readonly step = signal(0);
    readonly model = computed(() => geometryModel(this.settings.geometry!, this.step()));
    readonly trace = installProbe('angular', this.settings);
    readonly indicatorClass = indicatorClass;
    command(event: KeyboardEvent) {
        if (event.key !== 'F2' && event.key !== 'F3') return;
        event.preventDefault();
        this.step.set(event.key === 'F2' ? 1 : 2);
    }
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
}
