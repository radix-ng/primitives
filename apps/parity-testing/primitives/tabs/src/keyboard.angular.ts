import { Component, signal } from '@angular/core';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import {
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsPanelPresence,
    RdxTabsRoot,
    RdxTabsTab,
    type RdxTabsValueChangeEvent
} from '@radix-ng/primitives/tabs';
import { classes, config, installProbe } from './contract';
import { installKeyboardProbe, keyboardValues } from './keyboard';
import { AngularKeyboardRoot } from './keyboard-parts.angular';

@Component({
    selector: 'parity-tabs-keyboard',
    imports: [
        RdxTabsRoot,
        RdxTabsList,
        RdxTabsTab,
        RdxTabsPanel,
        RdxTabsPanelPresence,
        RdxDirectionProvider,
        AngularKeyboardRoot
    ],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [direction]="settings.dir ?? 'ltr'" rdxDirectionProvider>
            <button type="button" data-testid="outside">Before tabs</button>
            @if (settings.composed) {
                <parity-keyboard-root
                    [class]="s.root"
                    [value]="settings.controlled ? value() : undefined"
                    [defaultValue]="settings.initialNull ? null : 1"
                    [orientation]="settings.orientation ?? 'horizontal'"
                    [attr.dir]="settings.dir ?? 'ltr'"
                    (onValueChange)="change($event)"
                    data-testid="tabs-root"
                />
            } @else {
                <div
                    [class]="s.root"
                    [value]="settings.controlled ? value() : undefined"
                    [defaultValue]="settings.initialNull ? null : 1"
                    [orientation]="settings.orientation ?? 'horizontal'"
                    [attr.dir]="settings.dir ?? 'ltr'"
                    (onValueChange)="change($event)"
                    data-testid="tabs-root"
                    rdxTabsRoot
                >
                    <div
                        [class]="listClass"
                        [activateOnFocus]="settings.automatic ?? false"
                        [loopFocus]="settings.loop ?? true"
                        aria-label="Keyboard tabs"
                        data-testid="tablist"
                        rdxTabsList
                    >
                        @for (index of indices; track index) {
                            <button
                                [class]="s.tab"
                                [value]="index"
                                [disabled]="settings.disabled?.includes(index) ?? false"
                                [attr.data-testid]="'tab-' + index"
                                rdxTabsTab
                            >
                                Tab {{ index }}
                            </button>
                        }
                    </div>
                    @for (index of indices; track index) {
                        @if (settings.presence) {
                            <div
                                *rdxTabsPanelPresence="index"
                                [class]="panelClass"
                                [attr.data-testid]="'panel-' + index"
                                rdxTabsPanel
                            >
                                <label class="flex items-center gap-2">
                                    Panel {{ index }}
                                    <input class="w-24" [attr.data-testid]="'input-' + index" />
                                </label>
                                <button [attr.data-testid]="'action-' + index" type="button">Action {{ index }}</button>
                            </div>
                        } @else {
                            <div
                                [value]="index"
                                [class]="panelClass"
                                [attr.data-testid]="'panel-' + index"
                                keepMounted
                                rdxTabsPanel
                            >
                                <label class="flex items-center gap-2">
                                    Panel {{ index }}
                                    <input class="w-24" [attr.data-testid]="'input-' + index" />
                                </label>
                                <button [attr.data-testid]="'action-' + index" type="button">Action {{ index }}</button>
                            </div>
                        }
                    }
                </div>
            }
            <button type="button" data-testid="after">After tabs</button>
            <div class="h-[1100px]" aria-hidden="true"></div>
        </div>
    `
})
export class AngularKeyboard {
    readonly config = config();
    readonly settings = this.config.keyboard!;
    readonly value = signal<unknown>(this.settings.initialNull ? null : 1);
    readonly indices = keyboardValues;
    readonly s = classes;
    readonly listClass = 'flex gap-2' + (this.settings.orientation === 'vertical' ? ' flex-col' : '');
    readonly panelClass = 'border-border grid h-28 gap-2 rounded border p-3';
    readonly trace = installProbe('angular', this.config);
    private pending: unknown;
    constructor() {
        installKeyboardProbe();
    }
    command(event: KeyboardEvent) {
        if (event.key === 'F2' && this.settings.controlled === 'delay') {
            event.preventDefault();
            this.value.set(this.pending);
        }
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
        if (this.settings.controlled === 'accept') this.value.set(value);
        if (this.settings.controlled === 'delay') this.pending = value;
    }
}
