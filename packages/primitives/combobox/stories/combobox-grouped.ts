import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';

/** Options organized into sections with `RdxComboboxGroup` / `RdxComboboxGroupLabel`. A group hides
 * its heading automatically when all of its items are filtered out. */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-grouped',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div rdxComboboxRoot [(value)]="value">
            <div [class]="c.control">
                <input rdxComboboxInput placeholder="Search produce…" aria-label="Produce" [class]="c.input" />
                <button rdxComboboxTrigger aria-label="Open" [class]="c.trigger">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div *rdxComboboxPortal rdxComboboxPositioner [class]="c.positioner">
                <div rdxComboboxPopup [class]="c.popup">
                    <div rdxComboboxList aria-label="Produce" [class]="c.list">
                        <div rdxComboboxGroup>
                            <div rdxComboboxGroupLabel [class]="c.groupLabel">Fruits</div>
                            @for (fruit of fruits; track fruit) {
                                <div rdxComboboxItem [class]="c.item" [value]="fruit">
                                    <span rdxComboboxItemIndicator [class]="c.itemIndicator">
                                        <svg lucideCheck size="14"></svg>
                                    </span>
                                    {{ fruit }}
                                </div>
                            }
                        </div>
                        <div rdxComboboxGroup>
                            <div rdxComboboxGroupLabel [class]="c.groupLabel">Vegetables</div>
                            @for (vegetable of vegetables; track vegetable) {
                                <div rdxComboboxItem [class]="c.item" [value]="vegetable">
                                    <span rdxComboboxItemIndicator [class]="c.itemIndicator">
                                        <svg lucideCheck size="14"></svg>
                                    </span>
                                    {{ vegetable }}
                                </div>
                            }
                        </div>
                    </div>
                    <div rdxComboboxEmpty [class]="c.empty">No produce found.</div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxGrouped {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Grape', 'Orange'];
    readonly vegetables = ['Broccoli', 'Carrot', 'Leek', 'Spinach'];
}
