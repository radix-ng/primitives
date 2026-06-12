import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

/**
 * Template-driven forms: `[(ngModel)]` binds the input string two-way.
 */
@Component({
    selector: 'autocomplete-template-forms',
    imports: [_importsAutocomplete, FormsModule],
    template: `
        <div class="flex flex-col gap-3">
            <div [(ngModel)]="value" rdxAutocompleteRoot>
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

            <p class="text-muted-foreground text-sm">Value: {{ value() || '—' }}</p>
        </div>
    `
})
export class AutocompleteTemplateForms {
    protected readonly c = demoCombobox;
    readonly value = signal('');
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange'];
}
