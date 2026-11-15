import { Component, signal } from '@angular/core';
import {
    RdxTabsIndicator,
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsRoot,
    RdxTabsTab,
    RdxTabsValueChangeEvent
} from '@radix-ng/primitives/tabs';
import { classes, config, installProbe, type Value } from './contract';
import { directionListClass, directionTabClass } from './direction';

@Component({
    selector: 'parity-tabs-direction',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsIndicator],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <input data-testid="outside" aria-label="Outside tabs" />
        <output data-testid="app-value">{{ encode(value()) }}</output>
        <div
            [class]="s.root"
            [attr.dir]="direction.dir"
            [orientation]="direction.orientation"
            [value]="direction.kind === 'fallback' ? undefined : value()"
            [defaultValue]="settings.options[0].value"
            (onValueChange)="change($event)"
            data-testid="tabs-root"
            rdxTabsRoot
        >
            <div
                [class]="listClass"
                aria-label="External selection"
                data-testid="tablist"
                data-direction-part
                rdxTabsList
            >
                @for (option of options(); track option.value) {
                    <button
                        [class]="s.tab + tabClass"
                        [value]="option.value"
                        [disabled]="option.disabled ?? false"
                        [attr.data-testid]="'tab-' + option.value"
                        [attr.data-value]="encode(option.value)"
                        data-direction-part
                        rdxTabsTab
                    >
                        {{ option.label }}
                    </button>
                }
                <span class="pointer-events-none absolute" data-testid="indicator" rdxTabsIndicator></span>
            </div>
            @for (option of options(); track option.value) {
                <div
                    [class]="s.panel"
                    [value]="option.value"
                    [keepMounted]="true"
                    [attr.data-value]="encode(option.value)"
                    [attr.data-testid]="'panel-' + option.value"
                    data-direction-part
                    rdxTabsPanel
                >
                    Panel {{ option.label }}
                </div>
            }
        </div>
    `
})
export class AngularDirection {
    readonly settings = config();
    readonly direction = this.settings.direction!;
    readonly s = classes;
    readonly options = signal(this.settings.options);
    readonly value = signal<Value>(this.settings.value ?? this.settings.options[0].value);
    readonly trace = installProbe('angular', this.settings);
    readonly listClass = directionListClass(this.direction);
    readonly tabClass = directionTabClass(this.direction);
    readonly encode = (value: Value) => JSON.stringify(value);
    private cancelNext = this.direction.kind === 'cancel';

    command(event: KeyboardEvent) {
        if (!/^F(?:[2-9]|10)$/.test(event.key)) return;
        event.preventDefault();
        if (event.key === 'F2' || event.key === 'F5') this.value.set(this.settings.options[1].value);
        if (event.key === 'F3') this.value.set(this.settings.options[0].value);
        if (event.key === 'F4') this.value.set(null);
        if (event.key === 'F6') {
            const value = this.direction.kind === 'insert-number' ? 0 : 'Account';
            this.options.update((options) => [...options, { value, label: 'Account' }]);
            this.value.set(value);
        }
        if (event.key === 'F8')
            this.options.update((options) =>
                options.map((option) => ({ ...option, disabled: option.value === this.value() }))
            );
        if (event.key === 'F9') this.value.set('Missing');
        if (event.key === 'F10') this.value.set('Unknown');
    }

    change({ value, eventDetails: details }: RdxTabsValueChangeEvent) {
        if (this.cancelNext && details.reason === 'none') {
            details.cancel();
            this.cancelNext = false;
        }
        this.trace.change(
            value,
            details.reason,
            details.activationDirection,
            details.isCanceled(),
            details.event,
            details.trigger
        );
        if (!details.isCanceled()) this.value.set(value);
    }
}
