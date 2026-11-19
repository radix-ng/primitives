# Toolbar — Disabled

> One example from the [Toolbar](../components/toolbar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

A disabled `[rdxToolbarButton]` stays focusable by default (`focusableWhenDisabled`) so keyboard and
screen-reader users can still reach it.
Consumer click, pointerdown, mousedown, keydown and keyup handlers are suppressed while disabled.
Tab and arrow navigation remain available, as do hover and release handlers.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    LucideBold,
    LucideItalic,
    LucideTextAlignCenter,
    LucideTextAlignEnd,
    LucideTextAlignStart,
    LucideUnderline
} from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToggleGroupWithoutFocus } from '@radix-ng/primitives/toggle-group';
import { RdxToolbarButton, RdxToolbarLink, RdxToolbarRoot, RdxToolbarSeparator } from '@radix-ng/primitives/toolbar';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-toolbar-disabled-example',
    imports: [
        LucideBold,
        LucideItalic,
        LucideTextAlignCenter,
        LucideTextAlignEnd,
        LucideTextAlignStart,
        LucideUnderline,
        RdxToggle,
        RdxToggleGroupWithoutFocus,
        RdxToolbarButton,
        RdxToolbarLink,
        RdxToolbarRoot,
        RdxToolbarSeparator
    ],
    template: `
        <div class="demo-toolbar-root flex w-fit items-center gap-1 p-1" rdxToolbarRoot aria-label="Formatting options">
            <button
                class="demo-toolbar-button focus-visible:ring-ring inline-flex h-8 items-center justify-center px-2.5 focus-visible:ring-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                rdxToolbarButton
            >
                Bold
            </button>
            <button
                class="demo-toolbar-button focus-visible:ring-ring inline-flex h-8 items-center justify-center px-2.5 focus-visible:ring-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                rdxToolbarButton
                disabled
            >
                Italic
            </button>
            <div class="bg-border mx-1 h-5 w-px" rdxToolbarSeparator orientation="vertical"></div>
            <button
                class="demo-toolbar-button focus-visible:ring-ring inline-flex h-8 items-center justify-center px-2.5 focus-visible:ring-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                rdxToolbarButton
            >
                Underline
            </button>
        </div>
    `
})
export class ToolbarDisabledStory {}
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
