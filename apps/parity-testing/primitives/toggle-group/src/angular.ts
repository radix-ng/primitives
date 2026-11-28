import { Component, input, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxToggle, type RdxTogglePressedChangeEvent } from '@radix-ng/primitives/toggle';
import { RdxToggleGroup, type RdxToggleGroupValueChangeEvent } from '@radix-ng/primitives/toggle-group';
import { RdxToolbarButton, RdxToolbarGroup, RdxToolbarRoot } from '@radix-ng/primitives/toolbar';
import {
    authoredValue,
    direction,
    dynamicItems,
    dynamicMultiple,
    generatedValues,
    initialDefault,
    initialValue,
    installProbe,
    isCustomItem,
    isDisabledItem,
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
        @for (option of options(); track option.value) {
            @if (isCustomItem(option.value)) {
                <span
                    [value]="authoredValue(option.value)"
                    [nativeButton]="false"
                    [disabled]="isDisabledItem(option.value, firstDisabled())"
                    (onPressedChange)="item(option.value, $event)"
                    rdxToggle
                >
                    {{ option.label }}
                </span>
            } @else {
                <button
                    [value]="authoredValue(option.value)"
                    [disabled]="isDisabledItem(option.value, firstDisabled())"
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
    readonly options = input.required<typeof items>();
    readonly firstDisabled = input.required<boolean>();
    protected readonly authoredValue = authoredValue;
    protected readonly isCustomItem = isCustomItem;
    protected readonly isDisabledItem = isDisabledItem;

    protected item(value: string, change: RdxTogglePressedChangeEvent): void {
        recordItem(value, change.pressed, change.eventDetails);
    }
}

@Component({
    selector: 'parity-toggle-group',
    imports: [RdxToggleGroup, RdxToolbarButton, RdxToolbarGroup, RdxToolbarRoot, ToggleItems],
    template: `
        <input aria-label="Before" />
        @if (toolbar) {
            <div [disabled]="toolbarDisabled()" rdxToolbarRoot aria-label="Editing">
                <div [disabled]="toolbarGroupDisabled()" rdxToolbarGroup aria-label="Choices">
                    <div
                        [defaultValue]="defaults()"
                        [multiple]="multiple()"
                        (onValueChange)="request($event)"
                        rdxToggleGroup
                        aria-label="Formatting"
                    >
                        <parity-toggle-items [options]="options()" [firstDisabled]="firstDisabled()" />
                    </div>
                </div>
                <button rdxToolbarButton>Copy</button>
            </div>
            <button (click)="toolbarGroupDisabled.set(true)" type="button">Disable toolbar group</button>
            <button (click)="disableToolbar()" type="button">Disable toolbar</button>
        } @else {
            <div
                [controlledValue]="controlled()"
                [defaultValue]="defaults()"
                [multiple]="multiple()"
                [loopFocus]="loopFocus"
                [orientation]="orientation"
                [dir]="direction"
                (onValueChange)="request($event)"
                rdxToggleGroup
                aria-label="Formatting"
            >
                <parity-toggle-items [options]="options()" [firstDisabled]="firstDisabled()" />
            </div>
        }
        <button (click)="defaults.set(['italic'])" type="button">Change default</button>
        <button (click)="apply()" type="button">Apply request</button>
        <button (click)="controlled.set([])" type="button">Clear selection</button>
        @if (generatedValues) {
            <button (click)="firstDisabled.set(false)" type="button">Enable Bold</button>
        }
        @if (dynamicMultiple) {
            <button (click)="multiple.update(flip)" type="button">Toggle multiple</button>
        }
        @if (dynamicItems) {
            <button (click)="reverseItems()" type="button">Reverse items</button>
            <button (click)="removeBold()" type="button">Remove Bold</button>
            <button (click)="restoreBold()" type="button">Restore Bold</button>
        }
    `
})
class ToggleGroupFixture {
    protected readonly toolbar = toolbar;
    protected readonly toolbarDisabled = signal(false);
    protected readonly toolbarGroupDisabled = signal(false);
    protected readonly orientation = orientation;
    protected readonly direction = direction;
    protected readonly loopFocus = loopFocus;
    protected readonly multiple = signal(multiple);
    protected readonly dynamicMultiple = dynamicMultiple;
    protected readonly dynamicItems = dynamicItems;
    protected readonly generatedValues = generatedValues;
    protected readonly options = signal(items);
    protected readonly firstDisabled = signal(generatedValues);
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

    protected disableToolbar(): void {
        this.toolbarGroupDisabled.set(false);
        this.toolbarDisabled.set(true);
    }

    protected readonly flip = (value: boolean) => !value;

    protected reverseItems(): void {
        this.options.update((options) => options.slice().reverse());
    }

    protected removeBold(): void {
        this.options.update((options) => options.filter((option) => option.value !== 'bold'));
    }

    protected restoreBold(): void {
        this.options.update((options) => [items[0], ...options]);
    }
}

void bootstrapApplication(ToggleGroupFixture, { providers: [provideZonelessChangeDetection()] });
