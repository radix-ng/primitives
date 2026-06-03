import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';

/**
 * `RdxComboboxEmpty` renders only when no item matches the query — type something like "zzz" to see
 * it. The input also gets `data-list-empty` so the control itself can react.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-empty',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div rdxComboboxRoot [(value)]="value">
            <div [class]="c.control">
                <input rdxComboboxInput placeholder="Try typing 'zzz'…" aria-label="Fruit" [class]="c.input" />
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
                    <div rdxComboboxEmpty [class]="c.empty">No fruit matches your search.</div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxEmpty {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}
