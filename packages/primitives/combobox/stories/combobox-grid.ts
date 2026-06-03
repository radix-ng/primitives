import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';

/**
 * A 2D grid list (`grid`): `ArrowUp`/`ArrowDown` move between rows keeping the column, `ArrowLeft`/
 * `ArrowRight` move within a row. Items are wrapped in `RdxComboboxRow` and the list becomes
 * `role="grid"`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-grid',
    imports: [_importsCombobox, LucideChevronDown],
    template: `
        <div grid rdxComboboxRoot [(value)]="value">
            <div [class]="c.control">
                <input rdxComboboxInput placeholder="Pick a size…" aria-label="Size" [class]="c.input" />
                <button rdxComboboxTrigger aria-label="Open" [class]="c.trigger">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div *rdxComboboxPortal rdxComboboxPositioner [class]="c.positioner">
                <div rdxComboboxPopup [class]="c.popup">
                    <div rdxComboboxList aria-label="Sizes" [class]="list">
                        @for (row of rows; track $index) {
                            <div rdxComboboxRow [class]="rowClass">
                                @for (size of row; track size) {
                                    <div rdxComboboxItem [class]="cell" [value]="size">{{ size }}</div>
                                }
                            </div>
                        }
                    </div>
                    <div rdxComboboxEmpty [class]="c.empty">No size found.</div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxGrid {
    protected readonly c = demoCombobox;
    protected readonly list = 'flex flex-col gap-1 p-1';
    protected readonly rowClass = 'flex gap-1';
    protected readonly cell = cn(
        'flex h-9 flex-1 cursor-default items-center justify-center rounded-sm text-sm outline-none',
        'data-[highlighted]:bg-muted data-[selected]:bg-primary data-[selected]:text-primary-foreground'
    );

    readonly value = signal<string | null>(null);

    readonly rows = [
        ['XS', 'S', 'M', 'L'],
        ['XL', '2XL', '3XL', '4XL']
    ];
}
