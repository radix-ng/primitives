import { Component } from '@angular/core';
import {
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsPanelPresence,
    RdxTabsRoot,
    RdxTabsTab,
    RdxTabsValueChangeEvent
} from '@radix-ng/primitives/tabs';
import { classes, config, installProbe } from './contract';
import { nestedMotionClass, panelMotionClass } from './panels';

@Component({
    selector: 'parity-tabs-panels',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence],
    template: `
        <button data-testid="before" type="button">Before</button>
        <div
            [class]="s.root"
            [defaultValue]="settings.defaultValue"
            (onValueChange)="change($event)"
            data-testid="tabs-root"
            rdxTabsRoot
        >
            <div [class]="s.list" aria-label="Panel lifecycle" rdxTabsList>
                @for (option of settings.options; track option.value; let i = $index) {
                    <button [class]="s.tab" [value]="option.value" [attr.data-testid]="'tab-' + i" rdxTabsTab>
                        {{ option.label }}
                    </button>
                }
            </div>
            @for (option of settings.options; track option.value; let i = $index) {
                <div
                    [class]="s.panel + ' group' + motion"
                    [value]="option.value"
                    [keepMounted]="panels.keepMounted"
                    [attr.data-testid]="'panel-' + i"
                    rdxTabsPanel
                >
                    @if (panels.presence) {
                        <div *rdxTabsPanelPresence [attr.data-testid]="'content-' + i">
                            <div [class]="nested" [attr.data-testid]="'nested-' + i">
                                <input [attr.aria-label]="option.label + ' note'" [attr.data-testid]="'field-' + i" />
                                <button
                                    [attr.data-testid]="'action-' + i"
                                    (click)="trace.probe.activations[i] = trace.probe.activations[i] + 1"
                                    type="button"
                                >
                                    Action {{ option.label }}
                                </button>
                            </div>
                        </div>
                    } @else {
                        <div [attr.data-testid]="'content-' + i">
                            <div [class]="nested" [attr.data-testid]="'nested-' + i">
                                <input [attr.aria-label]="option.label + ' note'" [attr.data-testid]="'field-' + i" />
                                <button
                                    [attr.data-testid]="'action-' + i"
                                    (click)="trace.probe.activations[i] = trace.probe.activations[i] + 1"
                                    type="button"
                                >
                                    Action {{ option.label }}
                                </button>
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
        <button data-testid="after" type="button">After</button>
    `
})
export class AngularPanels {
    readonly settings = config();
    readonly panels = this.settings.panels!;
    readonly s = classes;
    readonly motion = panelMotionClass(this.panels);
    readonly nested = this.panels.nested ? nestedMotionClass : '';
    readonly trace = installProbe('angular', this.settings);

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
