import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-disabled',
    imports: [_importsAutocomplete],
    template: `
        <div disabled rdxAutocompleteRoot [(value)]="value">
            <div rdxAutocompleteInputGroup [class]="c.control">
                <input rdxAutocompleteInput placeholder="Disabled" aria-label="Fruit" [class]="c.input" />
            </div>

            <div *rdxAutocompletePortal rdxAutocompletePositioner [class]="c.positioner">
                <div rdxAutocompletePopup [class]="c.popup">
                    <div rdxAutocompleteList aria-label="Fruits" [class]="c.list">
                        @for (fruit of fruits; track fruit) {
                            <div rdxAutocompleteItem [class]="c.item">{{ fruit }}</div>
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
