# Combobox — Input inside the popup

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

A select-like pattern where the trigger shows the current value and the search input lives inside the
popup. Put `rdxComboboxAnchor` on the trigger so the popup anchors to it; the input takes focus when
the popup opens.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxComboboxAnchor,
    RdxComboboxEmpty,
    RdxComboboxInput,
    RdxComboboxItem,
    RdxComboboxItemIndicator,
    RdxComboboxLabel,
    RdxComboboxList,
    RdxComboboxPopup,
    RdxComboboxPortal,
    RdxComboboxPositioner,
    RdxComboboxRoot,
    RdxComboboxTrigger,
    RdxComboboxValue
} from '@radix-ng/primitives/combobox';

/**
 * A select-like pattern where the trigger shows the current value and the **search input lives inside
 * the popup**. `rdxComboboxAnchor` on the trigger anchors the popup; the input takes focus when the
 * popup opens.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-input-in-popup',
    imports: [
        RdxComboboxRoot,
        RdxComboboxAnchor,
        RdxComboboxLabel,
        RdxComboboxInput,
        RdxComboboxValue,
        RdxComboboxTrigger,
        RdxComboboxPortal,
        RdxComboboxPositioner,
        RdxComboboxPopup,
        RdxComboboxList,
        RdxComboboxItem,
        RdxComboboxItemIndicator,
        RdxComboboxEmpty,
        LucideChevronDown,
        LucideCheck
    ],
    template: `
        <div class="flex flex-col items-start gap-1" [(value)]="value" rdxComboboxRoot>
            <span class="text-foreground text-sm font-medium" rdxComboboxLabel>Fruit</span>
            <button
                class="demo-combobox-select-trigger data-[placeholder]:text-muted-foreground inline-flex h-9 w-64 items-center justify-between gap-2 px-3"
                rdxComboboxTrigger
                rdxComboboxAnchor
            >
                <span #selectedValue="rdxComboboxValue" rdxComboboxValue placeholder="Select a fruit">
                    {{ selectedValue.slotText() }}
                </span>
                <svg lucideChevronDown size="16"></svg>
            </button>

            <div class="z-50 w-64 data-[closed]:pointer-events-none" *rdxComboboxPortal rdxComboboxPositioner>
                <div
                    class="demo-combobox-popup mt-2 max-h-60 overflow-y-auto p-0 p-1 data-[closed]:hidden"
                    rdxComboboxPopup
                >
                    <div class="border-border border-b p-1">
                        <input
                            class="demo-combobox-popup-input placeholder:text-muted-foreground h-8 w-full px-2"
                            rdxComboboxInput
                            placeholder="Search…"
                            aria-label="Fruit"
                        />
                    </div>
                    <div class="flex flex-col p-1" rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex items-center py-1.5 pr-2 pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium"
                                [value]="fruit"
                                rdxComboboxItem
                            >
                                <span
                                    class="absolute left-2 flex size-3.5 items-center justify-center"
                                    rdxComboboxItemIndicator
                                >
                                    <svg lucideCheck size="14"></svg>
                                </span>
                                {{ fruit }}
                            </div>
                        }
                        <div class="demo-combobox-empty data-[empty]:py-6" rdxComboboxEmpty>No fruit found.</div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxInputInPopup {
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular`, `@tanstack/angular-virtual` when an example imports them.
