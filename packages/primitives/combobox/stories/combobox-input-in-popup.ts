import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

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
        <div class="flex flex-col items-start gap-1" [(value)]="value" rdxComboboxRoot>
            <span class="text-foreground text-sm font-medium" rdxComboboxLabel>Fruit</span>
            <button [class]="c.selectTrigger" rdxComboboxTrigger rdxComboboxAnchor>
                <span #selectedValue="rdxComboboxValue" rdxComboboxValue placeholder="Select a fruit">
                    {{ selectedValue.slotText() }}
                </span>
                <svg lucideChevronDown size="16"></svg>
            </button>

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="c.popup + ' p-0'" rdxComboboxPopup>
                    <div [class]="c.searchHeader">
                        <input [class]="c.popupInput" rdxComboboxInput placeholder="Search…" aria-label="Fruit" />
                    </div>
                    <div [class]="c.list + ' p-1'" rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [class]="c.item" [value]="fruit" rdxComboboxItem>
                                <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                    <svg lucideCheck size="14"></svg>
                                </span>
                                {{ fruit }}
                            </div>
                        }
                        <div [class]="c.empty" rdxComboboxEmpty>No fruit found.</div>
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
