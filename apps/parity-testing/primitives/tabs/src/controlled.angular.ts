import { Component, signal } from '@angular/core';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
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
import { controlledCatalog } from './controlled';

@Component({
    selector: 'parity-tabs-controlled',
    imports: [
        RdxTabsRoot,
        RdxTabsList,
        RdxTabsTab,
        RdxTabsPanel,
        RdxTabsPanelPresence,
        RdxTabsIndicator,
        RdxDirectionProvider
    ],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [direction]="settings.dir ?? 'ltr'" rdxDirectionProvider>
            <button type="button" data-testid="outside">Outside</button>
            <output data-testid="app-value">{{ catalog.encode(value()) }}</output>
            <div
                [class]="s.root"
                [value]="value()"
                [orientation]="settings.orientation ?? 'horizontal'"
                [attr.dir]="settings.dir ?? 'ltr'"
                (onValueChange)="change($event)"
                (valueChange)="outputs.push($event)"
                data-testid="tabs-root"
                rdxTabsRoot
            >
                <div
                    [class]="listClass"
                    [activateOnFocus]="settings.automatic ?? false"
                    data-testid="tablist"
                    aria-label="Controlled tabs"
                    rdxTabsList
                >
                    @for (index of order; track index) {
                        <button
                            [class]="s.tab"
                            [value]="catalog.values[index]"
                            [disabled]="settings.disabled && index === 0"
                            [attr.data-testid]="'tab-' + index"
                            rdxTabsTab
                        >
                            Tab {{ index }}
                        </button>
                    }
                    <span class="absolute top-0 left-0 h-1 w-1" data-testid="indicator" rdxTabsIndicator></span>
                </div>
                @for (index of order; track index) {
                    @if (settings.presence) {
                        <div
                            *rdxTabsPanelPresence="catalog.values[index]"
                            [class]="s.panel"
                            [attr.data-testid]="'panel-' + index"
                            rdxTabsPanel
                        >
                            Panel {{ index }}
                        </div>
                    } @else {
                        <div
                            [value]="catalog.values[index]"
                            [class]="s.panel"
                            [attr.data-testid]="'panel-' + index"
                            keepMounted
                            rdxTabsPanel
                        >
                            Panel {{ index }}
                        </div>
                    }
                }
            </div>
        </div>
    `
})
export class AngularControlled {
    readonly config = config();
    readonly settings = this.config.controlled!;
    readonly catalog = controlledCatalog(this.settings);
    readonly value = signal(this.catalog.initial);
    readonly order = [1, 0, 2];
    readonly s = classes;
    readonly listClass = 'relative flex gap-2' + (this.settings.orientation === 'vertical' ? ' flex-col' : '');
    readonly trace = installProbe('angular', this.config);
    readonly outputs: unknown[] = [];
    private pending: unknown;
    constructor() {
        window.tabsControlled = { catalog: this.catalog, parent: this.value, outputs: this.outputs };
    }
    command(event: KeyboardEvent) {
        if (!['F2', 'F3', 'F4', 'F6'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'F2' && this.settings.policy === 'delay') this.value.set(this.pending);
        if (event.key === 'F3') this.value.set(this.catalog.values[0]);
        if (event.key === 'F4') this.value.set(this.catalog.values[2]);
        if (event.key === 'F6') this.value.set(this.catalog.values[1]);
    }
    change({ value, eventDetails: details }: RdxTabsValueChangeEvent) {
        if (this.settings.policy === 'cancel') details.cancel();
        this.trace.change(
            value,
            details.reason,
            details.activationDirection,
            details.isCanceled(),
            details.event,
            details.trigger
        );
        if (details.isCanceled()) return;
        if (this.settings.policy === 'accept') this.value.set(value);
        if (this.settings.policy === 'delay') this.pending = value;
        if (this.settings.policy === 'replace') this.value.set(this.catalog.values[2]);
        if (this.settings.policy === 'null') this.value.set(null);
    }
}
