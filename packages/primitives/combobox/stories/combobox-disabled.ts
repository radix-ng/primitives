import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-disabled',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div disabled rdxComboboxRoot [(value)]="value">
            <div [class]="c.control">
                <input rdxComboboxInput placeholder="Search a fruit…" aria-label="Fruit" [class]="c.input" />
                <button rdxComboboxTrigger aria-label="Open" [class]="c.trigger">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div *rdxComboboxPortal rdxComboboxPositioner [class]="c.positioner">
                <div rdxComboboxPopup [class]="c.popup">
                    <div rdxComboboxList aria-label="Fruits" [class]="c.list">
                        @for (fruit of fruits; track fruit) {
                            <div rdxComboboxItem [class]="c.item" [value]="fruit">
                                <span rdxComboboxItemIndicator [class]="c.itemIndicator">
                                    <svg lucideCheck size="14"></svg>
                                </span>
                                {{ fruit }}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxDisabled {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>('Apple');
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape'];
}
