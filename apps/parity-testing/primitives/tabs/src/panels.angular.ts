import { NgTemplateOutlet } from '@angular/common';
import { Component, signal } from '@angular/core';
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
    imports: [NgTemplateOutlet, RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <button data-testid="before" type="button">Before</button>
        @if (showRoot()) {
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
                    @if (panels.presence) {
                        <div
                            *rdxTabsPanelPresence="option.value; keepMounted: keepMounted()"
                            [class]="s.panel + ' group' + motion"
                            [attr.data-testid]="'panel-' + i"
                            rdxTabsPanel
                        >
                            <ng-container [ngTemplateOutlet]="contents" [ngTemplateOutletContext]="{ $implicit: i }" />
                        </div>
                    } @else {
                        <div
                            [class]="s.panel + ' group' + motion"
                            [value]="option.value"
                            [keepMounted]="panels.keepMounted"
                            [attr.data-testid]="'panel-' + i"
                            rdxTabsPanel
                        >
                            <ng-container [ngTemplateOutlet]="contents" [ngTemplateOutletContext]="{ $implicit: i }" />
                        </div>
                    }
                }
            </div>
        }
        <button data-testid="after" type="button">After</button>
        <ng-template #contents let-i>
            <div [attr.data-testid]="'content-' + i">
                <div [class]="nested" [attr.data-testid]="'nested-' + i">
                    <input [attr.aria-label]="settings.options[i].label + ' note'" [attr.data-testid]="'field-' + i" />
                    <button
                        [attr.data-testid]="'action-' + i"
                        (click)="trace.probe.activations[i] = trace.probe.activations[i] + 1"
                        type="button"
                    >
                        Action {{ settings.options[i].label }}
                    </button>
                </div>
            </div>
        </ng-template>
    `
})
export class AngularPanels {
    readonly settings = config();
    readonly panels = this.settings.panels!;
    readonly showRoot = signal(true);
    readonly keepMounted = signal(this.panels.keepMounted);
    readonly s = classes;
    readonly motion = panelMotionClass(this.panels);
    readonly nested = this.panels.nested ? nestedMotionClass : '';
    readonly trace = installProbe('angular', this.settings);

    command(event: KeyboardEvent) {
        if (event.key !== 'F2' && event.key !== 'F3') return;
        event.preventDefault();
        if (event.key === 'F2') this.showRoot.set(false);
        if (event.key === 'F3') this.keepMounted.set(false);
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
