import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { RdxSelectRoot } from '@radix-ng/primitives/select';
import { SelectTypedControl } from '../../../packages/primitives/select/stories/select-typed-control';

interface Country {
    code: string;
    name: string;
}

@Component({
    imports: [RdxSelectRoot, SelectTypedControl, FormField],
    template: `
        <!-- @expect-error single-array-for-scalar-label -->
        <div [(value)]="countries" [multiple]="false" [itemToStringLabel]="label" rdxSelectRoot></div>
        <!-- @expect-error multiple-scalar -->
        <example-select [(value)]="country" [options]="options" [multiple]="true" [itemToStringLabel]="label" />
        <!-- @expect-error label-type -->
        <example-select [options]="options" [itemToStringLabel]="numberLabel" />
        <!-- @expect-error form-type -->
        <example-select [options]="options" [itemToStringLabel]="label" [formField]="fields.age" />
        <!-- @expect-error event-type -->
        <div
            [multiple]="false"
            [itemToStringLabel]="label"
            (onValueChange)="missing = $event.value?.missing"
            rdxSelectRoot
        ></div>
        <!-- @expect-error input-ref-type -->
        <div [inputRef]="numberLabel" rdxSelectRoot></div>
        <!-- @expect-error boolean-value -->
        <example-select [value]="18" [options]="[true, false]" [itemToStringLabel]="booleanLabel" />
        <!-- @expect-error date-form-type -->
        <example-select [options]="dates" [itemToStringLabel]="dateLabel" [formField]="fields.age" />
        <!-- @expect-error array-item-mode -->
        <example-select
            [value]="[1, 2]"
            [options]="coordinates"
            [multiple]="true"
            [itemToStringLabel]="coordinateLabel"
        />
        <!-- @expect-error symbol-event -->
        <div
            [value]="token"
            [multiple]="false"
            [itemToStringLabel]="symbolLabel"
            (onValueChange)="consumeDate($event.value)"
            rdxSelectRoot
        ></div>
    `
})
export class NegativeSelectTypes {
    readonly country = signal<Country | null | undefined>(undefined);
    readonly countries = signal<Country[] | undefined>([]);
    readonly options: Country[] = [{ code: 'fr', name: 'France' }];
    readonly label = (value: Country) => value.name;
    readonly numberLabel = (value: number) => String(value);
    readonly fields = form(signal({ age: 18 }));
    missing: unknown;
    readonly booleanLabel = (value: boolean) => String(value);
    readonly dateLabel = (value: Date) => value.toISOString();
    readonly coordinateLabel = (value: readonly number[]) => value.join(':');
    readonly symbolLabel = (value: symbol) => String(value);
    readonly dates = [new Date('2026-01-01')];
    readonly coordinates = [
        [1, 2],
        [3, 4]
    ] as const;
    readonly token = Symbol('token');
    consumeDate(value: Date | null | undefined): void {
        void value;
    }
}
