import { Component, computed, signal } from '@angular/core';
import {
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsPanelPresence,
    RdxTabsRoot,
    RdxTabsTab,
    type RdxTabsValueChangeEvent
} from '@radix-ng/primitives/tabs';
import { collectionModel, panelValues } from './collection';
import { classes, config, installProbe, type Value } from './contract';

@Component({
    selector: 'parity-tabs-collection',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <button type="button" data-testid="outside">Outside</button>
        <div
            [class]="s.root"
            [value]="collection.controlled ? value() : undefined"
            [defaultValue]="collection.implicit ? undefined : 1"
            [orientation]="model().orientation"
            [attr.dir]="model().dir"
            (onValueChange)="change($event)"
            data-testid="tabs-root"
            rdxTabsRoot
        >
            @if (model().showList) {
                @for (list of [{ key: model().listKey }]; track list.key) {
                    <div
                        [class]="model().listClass"
                        [activateOnFocus]="collection.activateOnFocus ?? false"
                        data-testid="tablist"
                        aria-label="Dynamic collection"
                        rdxTabsList
                    >
                        @for (option of model().options; track option.key) {
                            <button
                                [class]="s.tab"
                                [value]="option.value"
                                [disabled]="option.disabled"
                                [attr.data-value]="option.value"
                                [attr.data-testid]="'tab-' + option.value"
                                rdxTabsTab
                            >
                                Tab {{ option.value }}
                            </button>
                        }
                    </div>
                }
            }
            @for (panel of panels; track panel) {
                @if (collection.presence) {
                    <div
                        *rdxTabsPanelPresence="panel"
                        [class]="s.panel"
                        [attr.data-value]="panel"
                        [attr.data-testid]="'panel-' + panel"
                        rdxTabsPanel
                    >
                        Panel {{ panel }}
                    </div>
                } @else {
                    <div
                        [class]="s.panel"
                        [value]="panel"
                        [attr.data-value]="panel"
                        [attr.data-testid]="'panel-' + panel"
                        keepMounted
                        rdxTabsPanel
                    >
                        Panel {{ panel }}
                    </div>
                }
            }
        </div>
        <button type="button" data-testid="after">After</button>
    `
})
export class AngularCollection {
    readonly settings = config();
    readonly collection = this.settings.collection!;
    readonly step = signal(0);
    readonly model = computed(() => collectionModel(this.collection, this.step()));
    readonly value = signal<Value>(1);
    readonly panels = panelValues;
    readonly s = classes;
    readonly trace = installProbe('angular', this.settings);
    command(event: KeyboardEvent) {
        if (!['F2', 'F3', 'F4'].includes(event.key)) return;
        event.preventDefault();
        this.step.set(Number(event.key.slice(1)) - 1);
    }
    change({ value, eventDetails: details }: RdxTabsValueChangeEvent) {
        if (this.collection.cancelAutomatic && details.reason !== 'none') details.cancel();
        if (this.collection.cancelRequests && details.reason === 'none') details.cancel();
        this.trace.change(
            value,
            details.reason,
            details.activationDirection,
            details.isCanceled(),
            details.event,
            details.trigger
        );
        if (this.collection.controlled && !details.isCanceled()) this.value.set(value);
    }
}
