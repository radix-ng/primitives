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
        <!-- @expect-error single-array -->
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
}
