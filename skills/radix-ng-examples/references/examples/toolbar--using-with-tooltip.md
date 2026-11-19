# Toolbar — Using with Tooltip

> One example from the [Toolbar](../components/toolbar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Wrap toolbar buttons with a tooltip by stacking `[rdxTooltipTrigger]`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideBold, LucideItalic } from '@lucide/angular';
import { RdxToolbarButton, RdxToolbarRoot } from '@radix-ng/primitives/toolbar';
import {
    RdxTooltip,
    RdxTooltipArrow,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';

const itemClass =
    'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toolbar-with-tooltip',
    imports: [
        RdxToolbarRoot,
        RdxToolbarButton,
        RdxTooltip,
        RdxTooltipArrow,
        RdxTooltipPopup,
        RdxTooltipPortal,
        RdxTooltipPositioner,
        RdxTooltipTrigger,
        LucideBold,
        LucideItalic
    ],
    template: `
        <div class="demo-toolbar-root flex items-center gap-1 p-1" rdxToolbarRoot aria-label="Toolbar with tooltips">
            <ng-container rdxTooltip>
                <button class="${itemClass}" aria-label="Bold" rdxToolbarButton rdxTooltipTrigger>
                    <svg lucideBold size="16"></svg>
                </button>
                <div class="z-50" *rdxTooltipPortal sideOffset="8" rdxTooltipPositioner>
                    <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>Bold</div>
                    <span class="text-popover demo-arrow my-px" rdxTooltipArrow></span>
                </div>
            </ng-container>

            <ng-container rdxTooltip>
                <button class="${itemClass}" aria-label="Italic" rdxToolbarButton rdxTooltipTrigger>
                    <svg lucideItalic size="16"></svg>
                </button>
                <div class="z-50" *rdxTooltipPortal sideOffset="8" rdxTooltipPositioner>
                    <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>Italic</div>
                    <span class="text-popover demo-arrow my-px" rdxTooltipArrow></span>
                </div>
            </ng-container>
        </div>
    `
})
export class ToolbarWithTooltipExample {}
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
