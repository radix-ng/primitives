import { Component, signal } from '@angular/core';
import { RdxSelectRoot, RdxSelectValueChangeEvent } from '@radix-ng/primitives/select';
import { SelectItems } from '../../../packages/primitives/select/stories/select-items';
import { SelectTypedControl } from '../../../packages/primitives/select/stories/select-typed-control';
import { SelectTypedWrapper } from '../../../packages/primitives/select/stories/select-typed-wrapper';

interface Country {
    code: string;
    name: string;
}

@Component({
    imports: [RdxSelectRoot, SelectTypedControl, SelectTypedWrapper, SelectItems],
    template: `
        <div
            [(value)]="country"
            [multiple]="false"
            [itemToStringLabel]="label"
            [items]="items"
            [highlightItemOnHover]="false"
            (onValueChange)="single($event)"
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
        <div [value]="'fr'" [items]="{ fr: 'France' }" rdxSelectRoot></div>
        <div [value]="'fr'" [items]="[{ items: [{ value: 'fr', label: 'France' }] }]" rdxSelectRoot></div>
    `
})
export class PositiveSelectTypes {
    readonly country = signal<Country | null | undefined>(undefined);
    readonly countries = signal<Country[] | undefined>([]);
    readonly options: Country[] = [{ code: 'fr', name: 'France' }];
    readonly items = this.options.map((value) => ({ value, label: value.name }));
    readonly label = (value: Country) => value.name;
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
}
