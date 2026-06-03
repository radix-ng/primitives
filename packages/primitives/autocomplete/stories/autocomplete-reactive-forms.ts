import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Reactive forms: the form value **is** the input string (typed or selected). Bind `[formControl]`
 * directly to the root.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-reactive-forms',
    imports: [_importsAutocomplete, ReactiveFormsModule],
    template: `
        <div class="flex flex-col gap-3">
            <div rdxAutocompleteRoot [formControl]="fruit">
                <div rdxAutocompleteInputGroup [class]="c.control">
                    <input rdxAutocompleteInput placeholder="Search a fruit…" aria-label="Fruit" [class]="c.input" />
                </div>

                <div *rdxAutocompletePortal rdxAutocompletePositioner [class]="c.positioner">
                    <div rdxAutocompletePopup [class]="c.popup">
                        <div rdxAutocompleteList aria-label="Fruits" [class]="c.list">
                            @for (item of fruits; track item) {
                                <div rdxAutocompleteItem [class]="c.item">{{ item }}</div>
                            }
                        </div>
                        <div rdxAutocompleteEmpty [class]="c.empty">No fruit found.</div>
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
