# Toolbar — Using with NumberField

> One example from the [Toolbar](../components/toolbar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Stack `[rdxToolbarInput]` on a `[rdxNumberFieldInput]` to embed a number field. The input keeps native
text editing — the arrow keys move the caret and only move toolbar focus once the caret reaches the
matching edge.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideMinus, LucidePlus } from '@lucide/angular';
import {
    RdxNumberFieldDecrement,
    RdxNumberFieldIncrement,
    RdxNumberFieldInput,
    RdxNumberFieldRoot
} from '@radix-ng/primitives/number-field';
import { RdxToolbarButton, RdxToolbarInput, RdxToolbarRoot, RdxToolbarSeparator } from '@radix-ng/primitives/toolbar';

const stepClass =
    'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 disabled:opacity-50';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toolbar-with-number-field',
    imports: [
        RdxToolbarRoot,
        RdxToolbarButton,
        RdxToolbarInput,
        RdxToolbarSeparator,
        RdxNumberFieldRoot,
        RdxNumberFieldInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement,
        LucideMinus,
        LucidePlus
    ],
    template: `
        <div
            class="demo-toolbar-root flex items-center gap-1 p-1"
            rdxToolbarRoot
            aria-label="Toolbar with number field"
        >
            <button
                class="${'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2'}"
                rdxToolbarButton
            >
                Bold
            </button>

            <div class="bg-border mx-1 h-5 w-px" rdxToolbarSeparator orientation="vertical"></div>

            <div
                class="flex items-center gap-0.5"
                [value]="16"
                rdxNumberFieldRoot
                min="8"
                max="72"
                aria-label="Font size"
            >
                <button class="${stepClass}" aria-label="Decrease" rdxToolbarButton rdxNumberFieldDecrement>
                    <svg lucideMinus size="16"></svg>
                </button>
                <input
                    class="border-border bg-background text-foreground focus-visible:ring-ring h-8 w-12 rounded-md border text-center text-sm outline-none focus-visible:ring-2"
                    rdxToolbarInput
                    rdxNumberFieldInput
                />
                <button class="${stepClass}" aria-label="Increase" rdxToolbarButton rdxNumberFieldIncrement>
                    <svg lucidePlus size="16"></svg>
                </button>
            </div>
        </div>
    `
})
export class ToolbarWithNumberFieldExample {}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`. Copy the component from **Show code** and any shared files below,
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
