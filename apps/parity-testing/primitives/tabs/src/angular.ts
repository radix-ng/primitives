import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab, RdxTabsValueChangeEvent } from '@radix-ng/primitives/tabs';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { AngularActivation } from './activation.angular';
import { AngularCollection } from './collection.angular';
import { classes, config, installProbe } from './contract';
import { AngularDirection } from './direction.angular';
import { AngularGeometry } from './geometry.angular';
import { AngularIdentity } from './identity.angular';
import { AngularIndicator } from './indicator.angular';
import { AngularPanels } from './panels.angular';

const settings = config();
@Component({
    selector: 'parity-tabs',
    imports: [
        RdxTabsRoot,
        RdxTabsList,
        RdxTabsTab,
        RdxTabsPanel,
        AngularPanels,
        AngularDirection,
        AngularIdentity,
        AngularActivation,
        AngularIndicator,
        AngularGeometry,
        AngularCollection
    ],
    template: `
        @if (settings.collection) {
            <parity-tabs-collection />
        } @else if (settings.geometry) {
            <parity-tabs-geometry />
        } @else if (settings.indicator) {
            <parity-tabs-indicator />
        } @else if (settings.activation) {
            <parity-tabs-activation />
        } @else if (settings.identity) {
            <parity-tabs-identity />
        } @else if (settings.direction) {
            <parity-tabs-direction />
        } @else if (settings.panels) {
            <parity-tabs-panels />
        } @else {
            <div
                [class]="s.root"
                [defaultValue]="settings.defaultValue"
                [value]="settings.value"
                (onValueChange)="change($event)"
                data-testid="tabs-root"
                rdxTabsRoot
            >
                <div [class]="s.list" aria-label="Example tabs" rdxTabsList>
                    @for (option of settings.options; track option.value; let i = $index) {
                        <button
                            [class]="s.tab"
                            [value]="option.value"
                            [disabled]="option.disabled ?? false"
                            [attr.data-testid]="'tab-' + i"
                            rdxTabsTab
                        >
                            {{ option.label }}
                        </button>
                    }
                </div>
                @for (option of settings.options; track option.value; let i = $index) {
                    <div
                        [class]="s.panel"
                        [value]="option.value"
                        [keepMounted]="true"
                        [attr.data-testid]="'panel-' + i"
                        rdxTabsPanel
                    >
                        Panel {{ option.label }}
                    </div>
                }
            </div>
        }
    `
})
class AngularTabs {
    readonly settings = settings;
    readonly s = classes;
    readonly trace = installProbe('angular', settings);

    change({ value, eventDetails }: RdxTabsValueChangeEvent) {
        if (settings.cancelAutomatic && eventDetails.reason !== 'none') eventDetails.cancel();
        this.trace.change(
            value,
            eventDetails.reason,
            eventDetails.activationDirection,
            eventDetails.isCanceled(),
            eventDetails.event,
            eventDetails.trigger
        );
    }
}
void bootstrapApplication(AngularTabs, { providers: [provideZonelessChangeDetection()] });
