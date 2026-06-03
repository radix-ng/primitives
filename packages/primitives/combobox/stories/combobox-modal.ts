import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';

/**
 * Modal combobox: while open, page scroll is locked and content outside the popup is inert. A
 * backdrop sits behind the popup; clicking it dismisses.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-modal',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div modal rdxComboboxRoot [(value)]="value">
            <div [class]="c.control">
                <input rdxComboboxInput placeholder="Search a fruit…" aria-label="Fruit" [class]="c.input" />
                <button rdxComboboxTrigger aria-label="Open" [class]="c.trigger">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <ng-template rdxComboboxPortal>
                <div rdxComboboxBackdrop [class]="c.backdrop"></div>
                <div rdxComboboxPositioner [class]="c.positioner">
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
                        <div rdxComboboxEmpty [class]="c.empty">No fruit found.</div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class ComboboxModal {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
