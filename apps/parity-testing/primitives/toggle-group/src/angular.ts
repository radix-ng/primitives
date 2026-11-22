import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxToggle, type RdxTogglePressedChangeEvent } from '@radix-ng/primitives/toggle';
import {
    RdxToggleGroup,
    RdxToggleGroupWithoutFocus,
    type RdxToggleGroupValueChangeEvent
} from '@radix-ng/primitives/toggle-group';
import { RdxToolbarButton, RdxToolbarGroup, RdxToolbarRoot } from '@radix-ng/primitives/toolbar';
import {
    customItem,
    direction,
    disabledItem,
    initialDefault,
    initialValue,
    installProbe,
    items,
    loopFocus,
    multiple,
    orientation,
    recordGroup,
    recordItem,
    toolbar
} from './contract';

installProbe();

@Component({
    selector: 'parity-toggle-items',
    imports: [RdxToggle],
    template: `
        @for (option of options; track option.value) {
            @if (customItem && option.value === 'italic') {
                <span
                    [value]="option.value"
                    [nativeButton]="false"
                    [disabled]="disabledItem"
                    (onPressedChange)="item(option.value, $event)"
                    rdxToggle
                >
                    {{ option.label }}
                </span>
            } @else {
                <button
                    [value]="option.value"
                    [disabled]="disabledItem && option.value === 'italic'"
                    (onPressedChange)="item(option.value, $event)"
                    rdxToggle
                >
                    {{ option.label }}
                </button>
            }
        }
    `
})
class ToggleItems {
    protected readonly options = items;
    protected readonly customItem = customItem;
    protected readonly disabledItem = disabledItem;

    protected item(value: string, change: RdxTogglePressedChangeEvent): void {
        recordItem(value, change.pressed, change.eventDetails);
    }
}

@Component({
    selector: 'parity-toggle-group',
    imports: [
        RdxToggleGroup,
        RdxToggleGroupWithoutFocus,
        RdxToolbarButton,
        RdxToolbarGroup,
        RdxToolbarRoot,
        ToggleItems
    ],
    template: `
        <input aria-label="Before" />
        @if (toolbar) {
            <div rdxToolbarRoot aria-label="Editing">
                <div [disabled]="toolbarGroupDisabled()" rdxToolbarGroup aria-label="Choices">
                    <div (onValueChange)="request($event)" rdxToggleGroupWithoutFocus aria-label="Formatting">
                        <parity-toggle-items />
                    </div>
                </div>
                <button rdxToolbarButton>Copy</button>
            </div>
            <button (click)="toolbarGroupDisabled.set(true)" type="button">Disable toolbar group</button>
        } @else {
            <div
                [controlledValue]="controlled()"
                [defaultValue]="defaults()"
                [multiple]="multiple"
                [loopFocus]="loopFocus"
                [orientation]="orientation"
                [dir]="direction"
                (onValueChange)="request($event)"
                rdxToggleGroup
                aria-label="Formatting"
            >
                <parity-toggle-items />
            </div>
        }
        <button (click)="defaults.set(['italic'])" type="button">Change default</button>
        <button (click)="apply()" type="button">Apply request</button>
        <button (click)="controlled.set([])" type="button">Clear selection</button>
    `
})
class ToggleGroupFixture {
    protected readonly toolbar = toolbar;
    protected readonly toolbarGroupDisabled = signal(false);
    protected readonly orientation = orientation;
    protected readonly direction = direction;
    protected readonly loopFocus = loopFocus;
    protected readonly multiple = multiple;
    protected readonly defaults = signal<string[] | undefined>(initialDefault);
    protected readonly controlled = signal<string[] | undefined>(initialValue);
    private pending?: string[];

    protected request(change: RdxToggleGroupValueChangeEvent): void {
        recordGroup(change.value, change.eventDetails);
        this.pending = change.value;
    }

    protected apply(): void {
        this.controlled.set(this.pending);
    }
}

void bootstrapApplication(ToggleGroupFixture, { providers: [provideZonelessChangeDetection()] });
