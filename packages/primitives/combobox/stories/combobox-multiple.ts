import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideX } from '@lucide/angular';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-multiple',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck, LucideX],
    template: `
        <div multiple rdxComboboxRoot [(value)]="value">
            <div rdxComboboxAnchor [class]="control">
                @if (value().length) {
                    <div rdxComboboxChips [class]="c.chips">
                        @for (fruit of value(); track fruit) {
                            <span rdxComboboxChip [class]="c.chip" [value]="fruit">
                                {{ fruit }}
                                <button rdxComboboxChipRemove aria-label="Remove" [class]="c.chipRemove">
                                    <svg lucideX size="12"></svg>
                                </button>
                            </span>
                        }
                    </div>
                }
                <input
                    rdxComboboxInput
                    aria-label="Fruits"
                    [class]="c.inputInline"
                    [placeholder]="value().length ? '' : 'Add fruits…'"
                />
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
                    <div rdxComboboxEmpty [class]="c.empty">No fruit found.</div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxMultiple {
    protected readonly c = demoCombobox;
    protected readonly control = cn(demoCombobox.control, 'h-auto min-h-9 flex-wrap items-center gap-1 py-1 pl-1');
    readonly value = signal<string[]>(['Apple']);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
