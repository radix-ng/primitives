# Combobox — Dynamic order

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Tracked `@for` views can move without recreating their options. Keyboard navigation follows the new DOM order,
preserves the highlighted option, and reads updated disabled metadata. Open the popup to reverse the options.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxComboboxEmpty,
    RdxComboboxInput,
    RdxComboboxItem,
    RdxComboboxList,
    RdxComboboxPopup,
    RdxComboboxPortal,
    RdxComboboxPositioner,
    RdxComboboxRoot,
    RdxComboboxTrigger
} from '@radix-ng/primitives/combobox';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-reorder',
    imports: [
        RdxComboboxRoot,
        RdxComboboxInput,
        RdxComboboxTrigger,
        RdxComboboxPortal,
        RdxComboboxPositioner,
        RdxComboboxPopup,
        RdxComboboxList,
        RdxComboboxItem,
        RdxComboboxEmpty
    ],
    template: `
        <div [(value)]="value" rdxComboboxRoot>
            <div
                class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 w-64 items-center focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
            >
                <input
                    class="demo-combobox-input placeholder:text-muted-foreground h-full w-full pr-9 pl-3"
                    rdxComboboxInput
                    placeholder="Search a fruit…"
                    aria-label="Fruit"
                />
                <button
                    class="demo-combobox-trigger absolute top-1/2 right-1 inline-flex size-7 -translate-y-1/2 items-center justify-center disabled:pointer-events-none"
                    rdxComboboxTrigger
                    aria-label="Open"
                >
                    ⌄
                </button>
            </div>
            <div class="z-50 w-64 data-[closed]:pointer-events-none" *rdxComboboxPortal rdxComboboxPositioner>
                <div
                    class="demo-combobox-popup mt-2 max-h-60 overflow-y-auto p-1 data-[closed]:hidden"
                    rdxComboboxPopup
                >
                    <div class="border-border flex gap-2 border-b p-2">
                        <button
                            class="demo-button demo-button-outline px-2 py-1"
                            (pointerdown)="$event.preventDefault()"
                            (click)="reverse()"
                            type="button"
                        >
                            Reverse order
                        </button>
                        <button
                            class="demo-button demo-button-outline px-2 py-1"
                            [attr.aria-pressed]="grapeDisabled()"
                            (pointerdown)="$event.preventDefault()"
                            (click)="toggleGrape()"
                            type="button"
                        >
                            Disable Grape
                        </button>
                    </div>
                    <div class="flex flex-col" rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits(); track fruit) {
                            <div
                                class="demo-menu-item data-[highlighted]:bg-muted relative flex items-center py-1.5 pr-2 pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium"
                                [value]="fruit"
                                [disabled]="fruit === 'Grape' && grapeDisabled()"
                                rdxComboboxItem
                            >
                                {{ fruit }}
                            </div>
                        }
                    </div>
                    <div class="demo-combobox-empty data-[empty]:py-6" rdxComboboxEmpty>No fruit found.</div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxReorder {
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

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular`, `@tanstack/angular-virtual` when an example imports them.
