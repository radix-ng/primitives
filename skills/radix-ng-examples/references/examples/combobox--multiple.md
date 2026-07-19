# Combobox — Multiple

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Multiple selection: picks become chips before the input, the popup stays open between selections,
and Backspace in an empty input removes the last chip.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideX } from '@lucide/angular';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-multiple',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck, LucideX],
    template: `
        <div [(value)]="value" multiple rdxComboboxRoot>
            <div [class]="control" rdxComboboxAnchor>
                @if (value().length) {
                    <div [class]="c.chips" rdxComboboxChips>
                        @for (fruit of value(); track fruit) {
                            <span [class]="c.chip" [value]="fruit" rdxComboboxChip>
                                {{ fruit }}
                                <button [class]="c.chipRemove" rdxComboboxChipRemove aria-label="Remove">
                                    <svg lucideX size="12"></svg>
                                </button>
                            </span>
                        }
                    </div>
                }
                <input
                    [class]="c.inputInline"
                    [placeholder]="value().length ? '' : 'Add fruits…'"
                    rdxComboboxInput
                    aria-label="Fruits"
                />
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
                    <div [class]="c.empty" rdxComboboxEmpty>No fruit found.</div>
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
```
