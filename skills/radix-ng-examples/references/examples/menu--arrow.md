# Menu — Arrow

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Add `rdxMenuArrow` inside the popup to render a visual pointer connecting the popup to its trigger.
The arrow SVG fills with `currentColor`, so match the popup surface with a `text-*` token (e.g.
`text-popover`) rather than a `fill-*` class. A directional `drop-shadow` in the border color lets
the popup border flow into the arrow as one continuous outline.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxMenuArrow,
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-arrow',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuArrow,
        RdxMenuItem,
        RdxMenuSeparator
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>With Arrow</button>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="8" rdxMenuPositioner>
                <div
                    class="demo-menu-popup relative min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                    rdxMenuPopup
                >
                    <span class="text-popover demo-arrow my-px" rdxMenuArrow></span>
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        rdxMenuItem
                    >
                        New Tab
                    </button>
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        rdxMenuItem
                    >
                        New Window
                    </button>
                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        rdxMenuItem
                    >
                        Print…
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuArrowExampleComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
