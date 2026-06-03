import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';

/**
 * A select-like pattern where the trigger shows the current value and the **search input lives inside
 * the popup**. `rdxComboboxAnchor` on the trigger anchors the popup; the input takes focus when the
 * popup opens.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-input-in-popup',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div class="flex flex-col items-start gap-1" rdxComboboxRoot [(value)]="value">
            <span class="text-foreground text-sm font-medium" rdxComboboxLabel>Fruit</span>
            <button rdxComboboxTrigger rdxComboboxAnchor [class]="c.selectTrigger">
                <span #selectedValue="rdxComboboxValue" rdxComboboxValue placeholder="Select a fruit">
                    {{ selectedValue.slotText() }}
                </span>
                <svg lucideChevronDown size="16"></svg>
            </button>

            <div *rdxComboboxPortal rdxComboboxPositioner [class]="c.positioner">
                <div rdxComboboxPopup [class]="c.popup + ' p-0'">
                    <div [class]="c.searchHeader">
                        <input rdxComboboxInput placeholder="Search…" aria-label="Fruit" [class]="c.popupInput" />
                    </div>
                    <div rdxComboboxList aria-label="Fruits" [class]="c.list + ' p-1'">
                        @for (fruit of fruits; track fruit) {
                            <div rdxComboboxItem [class]="c.item" [value]="fruit">
                                <span rdxComboboxItemIndicator [class]="c.itemIndicator">
                                    <svg lucideCheck size="14"></svg>
                                </span>
                                {{ fruit }}
                            </div>
                        }
                        <div rdxComboboxEmpty [class]="c.empty">No fruit found.</div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxInputInPopup {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
