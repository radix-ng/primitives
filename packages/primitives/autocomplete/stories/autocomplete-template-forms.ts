import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Template-driven forms: `[(ngModel)]` binds the input string two-way.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-template-forms',
    imports: [_importsAutocomplete, FormsModule],
    template: `
        <div class="flex flex-col gap-3">
            <div rdxAutocompleteRoot [(ngModel)]="value">
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

            <p class="text-muted-foreground text-sm">Value: {{ value() || '—' }}</p>
        </div>
    `
})
export class AutocompleteTemplateForms {
    protected readonly c = demoCombobox;
    readonly value = signal('');
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange'];
}
