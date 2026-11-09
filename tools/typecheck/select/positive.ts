import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import {
    RdxSelectItem,
    RdxSelectRoot,
    RdxSelectRootActions,
    RdxSelectValueChangeEvent
} from '@radix-ng/primitives/select';
import { SelectArbitraryValues } from '../../../packages/primitives/select/stories/select-arbitrary-values';
import { SelectFocusManagement } from '../../../packages/primitives/select/stories/select-focus-management';
import { SelectItems } from '../../../packages/primitives/select/stories/select-items';
import { SelectLabels } from '../../../packages/primitives/select/stories/select-labels';
import { SelectNativeForms } from '../../../packages/primitives/select/stories/select-native-forms';
import { SelectTypedControl } from '../../../packages/primitives/select/stories/select-typed-control';
import { SelectTypedWrapper } from '../../../packages/primitives/select/stories/select-typed-wrapper';

interface Country {
    code: string;
    name: string;
}

@Component({
    imports: [
        RdxSelectRoot,
        SelectTypedControl,
        SelectTypedWrapper,
        SelectItems,
        SelectLabels,
        SelectNativeForms,
        SelectFocusManagement,
        SelectArbitraryValues,
        FormField
    ],
    template: `
        <div #actions="rdxSelectRoot" rdxSelectRoot>
            <button (click)="actions.close()" type="button">Close</button>
            <button (click)="actions.unmount()" type="button">Finish</button>
        </div>
        <div
            [(value)]="country"
            [multiple]="false"
            [itemToStringLabel]="label"
            [items]="items"
            [highlightItemOnHover]="false"
            [inputRef]="captureInput"
            (onValueChange)="single($event)"
            autoComplete="country"
            rdxSelectRoot
        ></div>
        <div
            [(value)]="countries"
            [multiple]="true"
            [itemToStringLabel]="label"
            (onValueChange)="multi($event)"
            rdxSelectRoot
        ></div>
        <example-select [(value)]="country" [options]="options" [itemToStringLabel]="label" />
        <example-select [(value)]="countries" [options]="options" [multiple]="true" [itemToStringLabel]="label" />
        <select-typed-wrapper />
        <select-items />
        <select-labels />
        <select-native-forms />
        <select-focus-management [closeOnFocusOut]="true" [keepMounted]="true" shell="dialog" />
        <select-arbitrary-values />
        <div [value]="'fr'" [items]="{ fr: 'France' }" rdxSelectRoot></div>
        <div [value]="'fr'" [items]="[{ items: [{ value: 'fr', label: 'France' }] }]" rdxSelectRoot></div>
        <div
            [(value)]="booleanValue"
            [multiple]="false"
            [itemToStringLabel]="booleanLabel"
            (onValueChange)="booleanChange($event)"
            rdxSelectRoot
        ></div>
        <div
            [(value)]="dates"
            [multiple]="true"
            [itemToStringValue]="dateLabel"
            (onValueChange)="dateChange($event)"
            rdxSelectRoot
        ></div>
        <div
            [(value)]="coordinates"
            [multiple]="false"
            [itemToStringLabel]="coordinateLabel"
            [itemToStringValue]="coordinateLabel"
            (onValueChange)="coordinateChange($event)"
            rdxSelectRoot
        ></div>
        <example-select [(value)]="symbolValue" [options]="symbols" [itemToStringLabel]="symbolLabel" />
        <example-select [(value)]="functionValue" [options]="functions" [itemToStringLabel]="functionLabel" />
        <example-select
            [options]="[true, false]"
            [formField]="arbitraryFields.enabled"
            [itemToStringLabel]="booleanLabel"
        />
        <example-select [options]="dateOptions" [formField]="arbitraryFields.date" [itemToStringLabel]="dateLabel" />
        <example-select
            [options]="coordinateOptions"
            [formField]="arbitraryFields.coordinates"
            [itemToStringLabel]="coordinateLabel"
        />
    `
})
export class PositiveSelectTypes {
    readonly booleanValue = signal<boolean | null | undefined>(false);
    readonly dates = signal<Date[] | undefined>([]);
    readonly coordinates = signal<readonly number[] | null | undefined>([1, 2]);
    readonly symbols = [Symbol('first'), Symbol('second')];
    readonly symbolValue = signal<symbol | null | undefined>(this.symbols[0]);
    readonly functions = [() => 'first', () => 'second'];
    readonly functionValue = signal<(() => string) | null | undefined>(this.functions[0]);
    readonly dateOptions = [new Date('2026-01-01')];
    readonly coordinateOptions = [
        [1, 2],
        [3, 4]
    ] as const;
    readonly arbitraryFields = form(
        signal({ enabled: false, date: this.dateOptions[0], coordinates: [1, 2] as readonly number[] })
    );
    readonly booleanLabel = (value: boolean) => (value ? 'Enabled' : 'Disabled');
    readonly dateLabel = (value: Date) => value.toISOString();
    readonly coordinateLabel = (value: readonly number[]) => value.join(':');
    readonly symbolLabel = (value: symbol) => value.description ?? '';
    readonly functionLabel = (value: () => string) => value();
    booleanChange(event: RdxSelectValueChangeEvent<boolean, false>): void {
        this.booleanValue.set(event.value);
    }
    dateChange(event: RdxSelectValueChangeEvent<Date, true>): void {
        this.dates.set(event.value);
    }
    coordinateChange(event: RdxSelectValueChangeEvent<readonly number[], false>): void {
        this.coordinates.set(event.value);
    }
    readSymbolItem(item: RdxSelectItem<symbol>): symbol | undefined {
        return item.value();
    }
    acceptActions(root: RdxSelectRoot): RdxSelectRootActions {
        return root;
    }
    readonly country = signal<Country | null | undefined>(undefined);
    readonly countries = signal<Country[] | undefined>([]);
    readonly options: Country[] = [{ code: 'fr', name: 'France' }];
    readonly items = this.options.map((value) => ({ value, label: value.name }));
    readonly label = (value: Country) => value.name;
    readonly nativeInput = signal<HTMLInputElement | null>(null);
    readonly captureInput = (input: HTMLInputElement | null) => this.nativeInput.set(input);
    single(event: RdxSelectValueChangeEvent<Country, false>): void {
        this.country.set(event.value);
    }
    multi(event: RdxSelectValueChangeEvent<Country, true>): void {
        this.countries.set(event.value);
    }

    checkImperativeTypes(root: RdxSelectRoot<Country, false>): void {
        root.setValue(this.options[0]);
        // @ts-expect-error A typed root cannot accept a different item type.
        root.setValue('fr');
        // @ts-expect-error Single selection cannot be written as an array.
        root.writeValue(this.options);
    }

    checkArbitraryTypes(root: RdxSelectRoot<boolean, false>, array: RdxSelectRoot<readonly number[], false>): void {
        root.setValue(false);
        // @ts-expect-error A boolean Root still rejects numbers.
        root.setValue(0);
        array.setValue([1, 2]);
        // @ts-expect-error An array-valued single item is not a scalar number.
        array.setValue(1);
    }
}
