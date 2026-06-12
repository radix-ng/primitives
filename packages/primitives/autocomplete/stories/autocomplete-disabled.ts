import { Component, signal } from '@angular/core';
import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

@Component({
    selector: 'autocomplete-disabled',
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" disabled rdxAutocompleteRoot>
            <div [class]="c.control" rdxAutocompleteInputGroup>
                <input [class]="c.input" rdxAutocompleteInput placeholder="Disabled" aria-label="Fruit" />
            </div>

            <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                <div [class]="c.popup" rdxAutocompletePopup>
                    <div [class]="c.list" rdxAutocompleteList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [class]="c.item" rdxAutocompleteItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteDisabled {
    protected readonly c = demoCombobox;
    readonly value = signal('Apple');
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}
