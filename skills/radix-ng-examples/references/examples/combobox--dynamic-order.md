# Combobox — Dynamic order

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Tracked `@for` views can move without recreating their options. Keyboard navigation follows the new DOM order,
preserves the highlighted option, and reads updated disabled metadata. Open the popup to reverse the options.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { cn, demoButton, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-reorder',
    imports: [_importsCombobox],
    template: `
        <div [(value)]="value" rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Search a fruit…" aria-label="Fruit" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">⌄</button>
            </div>
            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="c.popup" rdxComboboxPopup>
                    <div class="border-border flex gap-2 border-b p-2">
                        <button
                            [class]="button"
                            (pointerdown)="$event.preventDefault()"
                            (click)="reverse()"
                            type="button"
                        >
                            Reverse order
                        </button>
                        <button
                            [class]="button"
                            [attr.aria-pressed]="grapeDisabled()"
                            (pointerdown)="$event.preventDefault()"
                            (click)="toggleGrape()"
                            type="button"
                        >
                            Disable Grape
                        </button>
                    </div>
                    <div [class]="c.list" rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits(); track fruit) {
                            <div
                                [class]="c.item"
                                [value]="fruit"
                                [disabled]="fruit === 'Grape' && grapeDisabled()"
                                rdxComboboxItem
                            >
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
export class ComboboxReorder {
    protected readonly c = demoCombobox;
    protected readonly button = cn(demoButton.base, demoButton.outline, 'px-2 py-1');
    readonly value = signal<string | null>(null);
    readonly fruits = signal(['Apple', 'Banana', 'Grape']);
    readonly grapeDisabled = signal(false);

    reverse(): void {
        this.fruits.update((fruits) => [...fruits].reverse());
    }

    toggleGrape(): void {
        this.grapeDisabled.update((disabled) => !disabled);
    }
}
```
