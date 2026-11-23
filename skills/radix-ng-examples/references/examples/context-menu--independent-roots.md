# Context Menu — Independent Roots

> One example from the [Context Menu](../components/context-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Nest another `rdxContextMenuRoot` when an area owns a separate menu and selection lifecycle.
The inner Root has its own disabled state and cancellation policy. Selecting an image action closes
the image menu; the workspace menu stays open. Escape closes the deepest popup first. Use
`rdxMenuRoot` with `rdxMenuSubTrigger` for an ordinary submenu that shares its parent's command chain.

Both portals below use `keepMounted`. A retained inner popup remains interactive after reopening.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxContextMenuRoot, RdxContextMenuTrigger } from '@radix-ng/primitives/context-menu';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuSeparator
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-context-menu-independent',
    imports: [
        RdxContextMenuRoot,
        RdxContextMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid max-w-full gap-4">
            <ng-container rdxContextMenuRoot>
                <div
                    class="demo-menu-context-area data-[popup-open]:bg-muted flex min-h-36 min-w-64 items-center justify-center p-4 data-[popup-open]:border-solid"
                    tabindex="0"
                    rdxContextMenuTrigger
                >
                    Right-click the workspace
                </div>
                <ng-template [keepMounted]="true" rdxMenuPortal>
                    <div
                        class="z-50 data-[closed]:pointer-events-none"
                        side="right"
                        align="start"
                        sideOffset="4"
                        rdxMenuPositioner
                    >
                        <div
                            class="demo-menu-popup min-w-56! min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            aria-label="Workspace actions"
                            rdxMenuPopup
                        >
                            <div
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                (onSelect)="selected.set('New file')"
                                rdxMenuItem
                            >
                                New file
                            </div>
                            <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                            <ng-container rdxContextMenuRoot>
                                <div
                                    class="demo-menu-context-area data-[popup-open]:bg-muted m-1 flex min-h-24 flex-col items-center justify-center gap-1 p-4 text-center data-[popup-open]:border-solid"
                                    tabindex="0"
                                    rdxContextMenuTrigger
                                >
                                    Image preview
                                    <span class="text-muted-foreground text-xs">Right-click for image actions</span>
                                </div>
                                <ng-template [keepMounted]="true" rdxMenuPortal>
                                    <div
                                        class="z-50 data-[closed]:pointer-events-none"
                                        side="right"
                                        align="start"
                                        sideOffset="4"
                                        rdxMenuPositioner
                                    >
                                        <div
                                            class="demo-menu-popup min-w-44! min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                            aria-label="Image actions"
                                            rdxMenuPopup
                                        >
                                            <div
                                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                                (onSelect)="selected.set('Copy image')"
                                                rdxMenuItem
                                            >
                                                Copy image
                                            </div>
                                            <div
                                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                                (onSelect)="selected.set('Save image')"
                                                rdxMenuItem
                                            >
                                                Save image
                                            </div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <p class="text-muted-foreground max-w-72 text-sm">
                Image actions use an independent Root. Escape closes one menu at a time.
            </p>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
        </div>
    `
})
export class RdxContextMenuIndependentComponent {
    protected readonly selected = signal('none');
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
