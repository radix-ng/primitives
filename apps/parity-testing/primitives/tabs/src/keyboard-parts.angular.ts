import { Component } from '@angular/core';
import { RdxTabsList, RdxTabsPanel, RdxTabsPanelPresence, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';
import { classes, config } from './contract';
import { keyboardValues } from './keyboard';

@Component({
    selector: 'parity-keyboard-list',
    host: { class: 'contents' },
    imports: [RdxTabsList, RdxTabsTab],
    template: `
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
    `
})
class AngularKeyboardList {
    readonly settings = config().keyboard!;
    readonly indices = keyboardValues;
    readonly s = classes;
    readonly listClass = 'flex gap-2' + (this.settings.orientation === 'vertical' ? ' flex-col' : '');
}

@Component({
    selector: 'parity-keyboard-panels',
    host: { class: 'contents' },
    imports: [RdxTabsPanel, RdxTabsPanelPresence],
    template: `
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
    `
})
class AngularKeyboardPanels {
    readonly settings = config().keyboard!;
    readonly indices = keyboardValues;
    readonly panelClass = 'border-border grid h-28 gap-2 rounded border p-3';
}

@Component({
    selector: 'parity-keyboard-root',
    hostDirectives: [
        { directive: RdxTabsRoot, inputs: ['value', 'defaultValue', 'orientation'], outputs: ['onValueChange'] }
    ],
    imports: [AngularKeyboardList, AngularKeyboardPanels],
    template: `
        <parity-keyboard-list />
        <parity-keyboard-panels />
    `
})
export class AngularKeyboardRoot {}
