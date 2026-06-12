import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

/**
 * Reactive forms: the form value **is** the input string (typed or selected). Bind `[formControl]`
 * directly to the root.
 */
@Component({
    selector: 'autocomplete-reactive-forms',
    imports: [_importsAutocomplete, ReactiveFormsModule],
    template: `
        <div class="flex flex-col gap-3">
            <div [formControl]="fruit" rdxAutocompleteRoot>
                <div [class]="c.control" rdxAutocompleteInputGroup>
                    <input [class]="c.input" rdxAutocompleteInput placeholder="Search a fruit…" aria-label="Fruit" />
                </div>

                <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                    <div [class]="c.popup" rdxAutocompletePopup>
                        <div [class]="c.list" rdxAutocompleteList aria-label="Fruits">
                            @for (item of fruits; track item) {
                                <div [class]="c.item" rdxAutocompleteItem>{{ item }}</div>
                            }
                        </div>
                        <div [class]="c.empty" rdxAutocompleteEmpty>No fruit found.</div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">Value: {{ fruit.value || '—' }}</p>
        </div>
    `
})
export class AutocompleteReactiveForms {
    protected readonly c = demoCombobox;
    readonly fruit = new FormControl('Banana');
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange'];
}
