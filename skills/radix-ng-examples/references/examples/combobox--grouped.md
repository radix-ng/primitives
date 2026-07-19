# Combobox — Grouped

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Options organized into sections with `RdxComboboxGroup` / `RdxComboboxGroupLabel`. A group hides its
heading automatically once all of its items are filtered out.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/** Options organized into sections with `RdxComboboxGroup` / `RdxComboboxGroupLabel`. A group hides
 * its heading automatically when all of its items are filtered out. */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-grouped',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div [(value)]="value" rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Search produce…" aria-label="Produce" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="c.popup" rdxComboboxPopup>
                    <div [class]="c.list" rdxComboboxList aria-label="Produce">
                        <div rdxComboboxGroup>
                            <div [class]="c.groupLabel" rdxComboboxGroupLabel>Fruits</div>
                            @for (fruit of fruits; track fruit) {
                                <div [class]="c.item" [value]="fruit" rdxComboboxItem>
                                    <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                        <svg lucideCheck size="14"></svg>
                                    </span>
                                    {{ fruit }}
                                </div>
                            }
                        </div>
                        <div rdxComboboxGroup>
                            <div [class]="c.groupLabel" rdxComboboxGroupLabel>Vegetables</div>
                            @for (vegetable of vegetables; track vegetable) {
                                <div [class]="c.item" [value]="vegetable" rdxComboboxItem>
                                    <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                        <svg lucideCheck size="14"></svg>
                                    </span>
                                    {{ vegetable }}
                                </div>
                            }
                        </div>
                    </div>
                    <div [class]="c.empty" rdxComboboxEmpty>No produce found.</div>
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
```
