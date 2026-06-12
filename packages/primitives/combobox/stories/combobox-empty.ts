import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * `RdxComboboxEmpty` renders only when no item matches the query — type something like "zzz" to see
 * it. The input also gets `data-list-empty` so the control itself can react.
 */
@Component({
    selector: 'combobox-empty',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div [(value)]="value" rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Try typing 'zzz'…" aria-label="Fruit" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="c.popup" rdxComboboxPopup>
                    <div [class]="c.list" rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [class]="c.item" [value]="fruit" rdxComboboxItem>
                                <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                    <svg lucideCheck size="14"></svg>
                                </span>
                                {{ fruit }}
                            </div>
                        }
                    </div>
                    <div [class]="c.empty" rdxComboboxEmpty>No fruit matches your search.</div>
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
