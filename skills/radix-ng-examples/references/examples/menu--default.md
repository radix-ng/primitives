# Menu — Default

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

A basic dropdown with regular items, a disabled item, and a separator.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-default',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button
                class="demo-button demo-button-outline data-popup-open:bg-muted h-8 gap-1.5 ps-3 pe-2 leading-none"
                rdxMenuTrigger
            >
                File
            </button>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                <div
                    class="demo-popup demo-popup-motion min-w-[8rem] py-1 outline-none data-closed:pointer-events-none"
                    rdxMenuPopup
                >
                    <button class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start" rdxMenuItem>
                        New Tab
                    </button>
                    <button class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start" rdxMenuItem>
                        New Window
                    </button>
                    <button
                        class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start"
                        [disabled]="true"
                        rdxMenuItem
                    >
                        New Private Window
                    </button>
                    <div class="bg-foreground mx-1 my-1 h-px" rdxMenuSeparator></div>
                    <button class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start" rdxMenuItem>
                        Save Page As…
                    </button>
                    <button class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start" rdxMenuItem>
                        Print…
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuDefaultComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
