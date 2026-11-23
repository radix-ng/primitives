# Menu — Keep mounted

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

By default the popup mounts when the menu opens and unmounts when it closes (after any exit
animation). Set `[keepMounted]="true"` on the explicit `<ng-template rdxMenuPortal>` to keep the popup
in the DOM while closed — useful to query or pre-measure its content. While closed-and-settled the
positioner carries a native `hidden` (removed from layout, the accessibility tree, and the tab order),
Base UI-aligned; opening drops it. Focus still returns to the trigger (or a custom `finalFocus`
element) on close, exactly as with the default unmount behavior.

```html
<ng-template [keepMounted]="true" rdxMenuPortal>
    <div rdxMenuPositioner>
        <div rdxMenuPopup>…items…</div>
    </div>
</ng-template>
```

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

/**
 * `keepMounted` keeps the popup in the DOM (portaled) while the menu is closed, so a consumer can query
 * or animate it without it unmounting. The positioner carries a native `hidden` while closed-and-settled
 * (removed from layout / a11y / tab order), Base UI-aligned.
 */
@Component({
    selector: 'rdx-menu-keep-mounted',
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
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>File</button>

            <ng-template [keepMounted]="true" rdxMenuPortal>
                <div class="z-50 data-[closed]:pointer-events-none" sideOffset="4" rdxMenuPositioner>
                    <div
                        class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                        rdxMenuPopup
                    >
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuItem
                        >
                            New Tab
                        </button>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuItem
                        >
                            New Window
                        </button>
                        <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuItem
                        >
                            Print…
                        </button>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
export class RdxMenuKeepMountedComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
