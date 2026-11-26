# Combobox — Multiple

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Multiple selection: picks become chips before the input, the popup stays open between selections,
and Backspace in an empty input removes the last chip.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideX } from '@lucide/angular';
import {
    RdxComboboxAnchor,
    RdxComboboxChip,
    RdxComboboxChipRemove,
    RdxComboboxChips,
    RdxComboboxEmpty,
    RdxComboboxInput,
    RdxComboboxItem,
    RdxComboboxItemIndicator,
    RdxComboboxList,
    RdxComboboxPopup,
    RdxComboboxPortal,
    RdxComboboxPositioner,
    RdxComboboxRoot,
    RdxComboboxTrigger
} from '@radix-ng/primitives/combobox';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-multiple',
    imports: [
        RdxComboboxRoot,
        RdxComboboxAnchor,
        RdxComboboxInput,
        RdxComboboxTrigger,
        RdxComboboxPortal,
        RdxComboboxPositioner,
        RdxComboboxPopup,
        RdxComboboxList,
        RdxComboboxItem,
        RdxComboboxItemIndicator,
        RdxComboboxEmpty,
        RdxComboboxChips,
        RdxComboboxChip,
        RdxComboboxChipRemove,
        LucideChevronDown,
        LucideCheck,
        LucideX
    ],
    template: `
        <div [(value)]="value" multiple rdxComboboxRoot>
            <div
                class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 h-auto min-h-9 w-64 flex-wrap items-center gap-1 py-1 pl-1 focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
                rdxComboboxAnchor
            >
                @if (value().length) {
                    <div class="contents" rdxComboboxChips>
                        @for (fruit of value(); track fruit) {
                            <span
                                class="demo-combobox-chip inline-flex items-center gap-1 px-1.5 py-0.5"
                                [value]="fruit"
                                rdxComboboxChip
                            >
                                {{ fruit }}
                                <button
                                    class="hover:bg-border inline-flex size-3.5 items-center justify-center rounded-full"
                                    rdxComboboxChipRemove
                                    aria-label="Remove"
                                >
                                    <svg lucideX size="12"></svg>
                                </button>
                            </span>
                        }
                    </div>
                }
                <input
                    class="demo-combobox-input-inline placeholder:text-muted-foreground min-w-24 flex-1"
                    [placeholder]="value().length ? '' : 'Add fruits…'"
                    rdxComboboxInput
                    aria-label="Fruits"
                />
                <button
                    class="demo-combobox-trigger absolute top-1/2 right-1 inline-flex size-7 -translate-y-1/2 items-center justify-center disabled:pointer-events-none"
                    rdxComboboxTrigger
                    aria-label="Open"
                >
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div class="z-50 w-64 data-[closed]:pointer-events-none" *rdxComboboxPortal rdxComboboxPositioner>
                <div
                    class="demo-combobox-popup mt-2 max-h-60 overflow-y-auto p-1 data-[closed]:hidden"
                    rdxComboboxPopup
                >
                    <div class="flex flex-col" rdxComboboxList aria-label="Fruits">
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
                    </div>
                    <div class="demo-combobox-empty data-[empty]:py-6" rdxComboboxEmpty>No fruit found.</div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxMultiple {
    readonly value = signal<string[]>(['Apple']);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular`, `@tanstack/angular-virtual` when an example imports them.
