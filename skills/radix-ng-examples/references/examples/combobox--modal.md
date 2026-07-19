# Combobox — Modal

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

With `modal`, page scroll is locked and content outside the popup is inert while open. Add a
`rdxComboboxBackdrop` (styled `position: fixed; inset: 0; pointer-events: auto`) behind the popup;
clicking it dismisses.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * Modal combobox: while open, page scroll is locked and content outside the popup is inert. A
 * backdrop sits behind the popup; clicking it dismisses.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-modal',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div [(value)]="value" modal rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Search a fruit…" aria-label="Fruit" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <ng-template rdxComboboxPortal>
                <div [class]="c.backdrop" rdxComboboxBackdrop></div>
                <div [class]="c.positioner" rdxComboboxPositioner>
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
            </ng-template>
        </div>
    `
})
export class ComboboxModal {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
```
