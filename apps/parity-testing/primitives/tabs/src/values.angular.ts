import { Component, computed, signal } from '@angular/core';
import {
    RdxTabsIndicator,
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsPanelPresence,
    RdxTabsRoot,
    RdxTabsTab,
    type RdxTabsValueChangeEvent
} from '@radix-ng/primitives/tabs';
import { classes, config, installProbe } from './contract';
import { createValues } from './values';

@Component({
    selector: 'parity-tabs-values',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence, RdxTabsIndicator],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <button type="button" data-testid="outside">Outside</button>
        <div
            [class]="s.root"
            [value]="settings.controlled ? value() : undefined"
            [defaultValue]="catalog.initial"
            (onValueChange)="change($event)"
            data-testid="tabs-root"
            rdxTabsRoot
        >
            <div class="relative flex gap-2" data-testid="tablist" aria-label="Value identities" rdxTabsList>
                @for (option of options(); track option.key) {
                    <button
                        [class]="s.tab"
                        [value]="option.value"
                        [disabled]="step() === 3 && option.key === 'second'"
                        [attr.data-testid]="'tab-' + option.key"
                        rdxTabsTab
                    >
                        {{ option.key }}
                    </button>
                }
                <span class="absolute top-0 left-0 h-1 w-1" data-testid="indicator" rdxTabsIndicator></span>
            </div>
            @for (option of catalog.options; track option.key) {
                @if (settings.presence) {
                    <div
                        *rdxTabsPanelPresence="option.value"
                        [class]="s.panel"
                        [attr.data-testid]="'panel-' + option.key"
                        rdxTabsPanel
                    >
                        {{ option.key }}
                    </div>
                } @else {
                    <div
                        [class]="s.panel"
                        [value]="option.value"
                        [attr.data-testid]="'panel-' + option.key"
                        keepMounted
                        rdxTabsPanel
                    >
                        {{ option.key }}
                    </div>
                }
            }
        </div>
    `
})
export class AngularValues {
    readonly config = config();
    readonly settings = this.config.values!;
    readonly catalog = createValues(this.settings);
    readonly value = signal(this.catalog.initial);
    readonly step = signal(0);
    readonly options = computed(() => (this.step() === 1 ? this.catalog.options.slice(1) : this.catalog.options));
    readonly s = classes;
    readonly trace = installProbe('angular', this.config);
    constructor() {
        window.tabsValues = { catalog: this.catalog };
    }
    command(event: KeyboardEvent) {
        if (this.settings.controlled && (event.key === 'F5' || event.key === 'F6')) {
            event.preventDefault();
            this.value.set(this.catalog.options[event.key === 'F5' ? 2 : 0].value);
            return;
        }
        if (!['F2', 'F3', 'F4'].includes(event.key)) return;
        event.preventDefault();
        this.step.set(Number(event.key.slice(1)) - 1);
    }
    change({ value, eventDetails: details }: RdxTabsValueChangeEvent) {
        if (this.settings.cancel && details.reason === 'none') details.cancel();
        this.trace.change(
            value,
            details.reason,
            details.activationDirection,
            details.isCanceled(),
            details.event,
            details.trigger
        );
        if (this.settings.controlled && !details.isCanceled()) this.value.set(value);
    }
}
