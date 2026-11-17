import { Component, inject, InjectionToken, input, signal } from '@angular/core';
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
import { hydrationClasses, type HydrationChange, type HydrationSettings } from './cases';
export const HYDRATION_SETTINGS = new InjectionToken<HydrationSettings>('Tabs hydration fixture settings');
export const HYDRATION_CHANGES = new InjectionToken<HydrationChange[]>('Tabs hydration fixture changes');

@Component({
    selector: 'parity-hydration-group',
    imports: [
        RdxTabsRoot,
        RdxTabsList,
        RdxTabsTab,
        RdxTabsPanel,
        RdxTabsPanelPresence,
        RdxTabsIndicator,
        RdxDirectionProvider
    ],
    template: `
        <div [direction]="settings.rtl ? 'rtl' : 'ltr'" rdxDirectionProvider>
            <div
                [class]="s.root"
                [orientation]="settings.vertical ? 'vertical' : 'horizontal'"
                [defaultValue]="settings.implicit ? undefined : settings.value"
                [value]="settings.controlled ? value() : undefined"
                [attr.dir]="settings.rtl ? 'rtl' : 'ltr'"
                [attr.data-hydration-root]="index()"
                (onValueChange)="change($event)"
                rdxTabsRoot
            >
                <div [class]="settings.vertical ? s.vertical : s.list" aria-label="Hydration tabs" rdxTabsList>
                    @for (item of items; track item) {
                        <button
                            [class]="
                                s.tab +
                                (item === settings.value && settings.transformed ? ' translate-x-3' : '') +
                                (item === settings.value && settings.zero ? ' hidden' : '')
                            "
                            [value]="item"
                            [id]="settings.authored ? 'authored-tab-' + item : undefined"
                            [attr.data-part]="'tab-' + item"
                            rdxTabsTab
                        >
                            Tab {{ item }}
                        </button>
                    }
                    <span
                        [class]="s.indicator"
                        [renderBeforeHydration]="settings.prepaint ?? false"
                        data-part="indicator"
                        rdxTabsIndicator
                    ></span>
                </div>
                @for (item of items; track item) {
                    @if (settings.presence) {
                        <div
                            *rdxTabsPanelPresence="item"
                            [class]="s.panel"
                            [attr.data-part]="'panel-' + item"
                            rdxTabsPanel
                        >
                            <input [attr.aria-label]="'Panel ' + item" [attr.data-part]="'field-' + item" />
                        </div>
                    } @else {
                        <div
                            [value]="item"
                            [class]="s.panel"
                            [attr.data-part]="'panel-' + item"
                            keepMounted
                            rdxTabsPanel
                        >
                            <input [attr.aria-label]="'Panel ' + item" [attr.data-part]="'field-' + item" />
                        </div>
                    }
                }
            </div>
        </div>
    `
})
export class HydrationGroup {
    readonly index = input(0);
    readonly settings = inject(HYDRATION_SETTINGS);
    readonly changes = inject(HYDRATION_CHANGES);
    readonly value = signal<unknown>(this.settings.value);
    readonly items = [0, 1, 2];
    readonly s = hydrationClasses;
    change({ value, eventDetails }: RdxTabsValueChangeEvent) {
        this.changes.push({ group: this.index(), value, reason: eventDetails.reason });
        if (this.settings.controlled) this.value.set(value);
    }
}
@Component({
    selector: 'parity-hydration-tabs',
    imports: [HydrationGroup],
    template: `
        @for (index of groups; track index) {
            <parity-hydration-group [index]="index" />
        }
    `
})
export class AngularHydrationTabs {
    readonly groups = inject(HYDRATION_SETTINGS).multiple ? [0, 1] : [0];
}
