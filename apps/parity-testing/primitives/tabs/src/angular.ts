import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab, RdxTabsValueChangeEvent } from '@radix-ng/primitives/tabs';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { classes, config, installProbe } from './contract';
import { AngularDirection } from './direction.angular';
import { AngularPanels } from './panels.angular';

const settings = config();
@Component({
    selector: 'parity-tabs',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, AngularPanels, AngularDirection],
    template: `
        @if (settings.direction) {
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
