import { Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * A 2D grid list (`grid`): `ArrowUp`/`ArrowDown` move between rows keeping the column, `ArrowLeft`/
 * `ArrowRight` move within a row. Items are wrapped in `RdxComboboxRow` and the list becomes
 * `role="grid"`.
 */
@Component({
    selector: 'combobox-grid',
    imports: [_importsCombobox, LucideChevronDown],
    template: `
        <div [(value)]="value" grid rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Pick a size…" aria-label="Size" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="c.popup" rdxComboboxPopup>
                    <div [class]="list" rdxComboboxList aria-label="Sizes">
                        @for (row of rows; track $index) {
                            <div [class]="rowClass" rdxComboboxRow>
                                @for (size of row; track size) {
                                    <div [class]="cell" [value]="size" rdxComboboxItem>{{ size }}</div>
                                }
                            </div>
                        }
                    </div>
                    <div [class]="c.empty" rdxComboboxEmpty>No size found.</div>
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
