# Toolbar — Using with Menu

> One example from the [Toolbar](../components/toolbar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Render a `[rdxMenuTrigger]` on a toolbar button to open a menu from the toolbar.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';
import { RdxToolbarButton, RdxToolbarRoot, RdxToolbarSeparator } from '@radix-ng/primitives/toolbar';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toolbar-with-menu',
    imports: [
        RdxToolbarRoot,
        RdxToolbarButton,
        RdxToolbarSeparator,
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator,
        LucideChevronDown
    ],
    template: `
        <div class="demo-toolbar-root flex items-center gap-1 p-1" rdxToolbarRoot aria-label="Toolbar with menu">
            <button
                class="${'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2'}"
                rdxToolbarButton
            >
                Bold
            </button>
            <button
                class="${'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2'}"
                rdxToolbarButton
            >
                Italic
            </button>

            <div class="bg-border mx-1 h-5 w-px" rdxToolbarSeparator orientation="vertical"></div>

            <ng-container #menu="rdxMenuRoot" rdxMenuRoot>
                <button
                    class="demo-toolbar-button focus-visible:ring-ring data-[popup-open]:bg-muted inline-flex h-8 items-center justify-center gap-1 px-2.5 focus-visible:ring-2"
                    rdxToolbarButton
                    rdxMenuTrigger
                >
                    More
                    <svg lucideChevronDown size="14"></svg>
                </button>

                @if (menu.open()) {
                    <div class="z-50 data-[closed]:pointer-events-none" sideOffset="6" rdxMenuPositioner>
                        <div
                            class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                rdxMenuItem
                            >
                                Undo
                            </button>
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                rdxMenuItem
                            >
                                Redo
                            </button>
                            <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                rdxMenuItem
                            >
                                Clear formatting
                            </button>
                        </div>
                    </div>
                }
            </ng-container>
        </div>
    `
})
export class ToolbarWithMenuExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
