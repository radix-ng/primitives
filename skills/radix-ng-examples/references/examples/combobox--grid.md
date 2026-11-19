# Combobox — Grid

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

A 2D grid (`grid`): wrap items in `RdxComboboxRow` and the list becomes `role="grid"`. `ArrowUp` /
`ArrowDown` move between rows keeping the column; `ArrowLeft` / `ArrowRight` move within a row.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import {
    RdxComboboxEmpty,
    RdxComboboxInput,
    RdxComboboxItem,
    RdxComboboxList,
    RdxComboboxPopup,
    RdxComboboxPortal,
    RdxComboboxPositioner,
    RdxComboboxRoot,
    RdxComboboxRow,
    RdxComboboxTrigger
} from '@radix-ng/primitives/combobox';

/**
 * A 2D grid list (`grid`): `ArrowUp`/`ArrowDown` move between rows keeping the column, `ArrowLeft`/
 * `ArrowRight` move within a row. Items are wrapped in `RdxComboboxRow` and the list becomes
 * `role="grid"`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-grid',
    imports: [
        RdxComboboxRoot,
        RdxComboboxInput,
        RdxComboboxTrigger,
        RdxComboboxPortal,
        RdxComboboxPositioner,
        RdxComboboxPopup,
        RdxComboboxList,
        RdxComboboxRow,
        RdxComboboxItem,
        RdxComboboxEmpty,
        LucideChevronDown
    ],
    template: `
        <div [(value)]="value" grid rdxComboboxRoot>
            <div
                class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 w-64 items-center focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
            >
                <input
                    class="demo-combobox-input placeholder:text-muted-foreground h-full w-full pr-9 pl-3"
                    rdxComboboxInput
                    placeholder="Pick a size…"
                    aria-label="Size"
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
                    <div class="flex flex-col gap-1 p-1" rdxComboboxList aria-label="Sizes">
                        @for (row of rows; track $index) {
                            <div class="flex gap-1" rdxComboboxRow>
                                @for (size of row; track size) {
                                    <div
                                        class="data-[highlighted]:bg-muted data-[selected]:bg-primary data-[selected]:text-primary-foreground flex h-9 flex-1 cursor-default items-center justify-center rounded-sm text-sm outline-none"
                                        [value]="size"
                                        rdxComboboxItem
                                    >
                                        {{ size }}
                                    </div>
                                }
                            </div>
                        }
                    </div>
                    <div class="demo-combobox-empty data-[empty]:py-6" rdxComboboxEmpty>No size found.</div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxGrid {
    readonly value = signal<string | null>(null);

    readonly rows = [
        ['XS', 'S', 'M', 'L'],
        ['XL', '2XL', '3XL', '4XL']
    ];
}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`, `@tanstack/angular-virtual`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
