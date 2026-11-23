# Context Menu — Sides

> One example from the [Context Menu](../components/context-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Set `side` on `rdxMenuPositioner` to prefer `top`, `right`, `bottom`, or `left` relative to the
pointer anchor. Each area owns an independent menu. `sideOffset` leaves a gap, and collision
avoidance can flip the popup when its preferred side has insufficient space.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxContextMenuRoot, RdxContextMenuTrigger } from '@radix-ng/primitives/context-menu';
import { RdxMenuItem, RdxMenuPopup, RdxMenuPortal, RdxMenuPositioner } from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-context-menu-sides',
    imports: [RdxContextMenuRoot, RdxContextMenuTrigger, RdxMenuPortal, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'w-full max-w-md' },
    template: `
        <div class="grid grid-cols-2 gap-4">
            @for (side of sides; track side) {
                <ng-container rdxContextMenuRoot>
                    <div
                        class="demo-menu-context-area data-[popup-open]:bg-muted flex aspect-video w-full flex-col items-center justify-center gap-1 p-4 data-[popup-open]:border-solid"
                        tabindex="0"
                        rdxContextMenuTrigger
                    >
                        <span class="font-medium capitalize">{{ side }}</span>
                        <span class="pointer-coarse:hidden">Right-click here</span>
                        <span class="hidden pointer-coarse:inline">Long-press here</span>
                    </div>
                    <ng-template rdxMenuPortal>
                        <div
                            class="z-50 data-[closed]:pointer-events-none"
                            [side]="side"
                            align="start"
                            sideOffset="8"
                            rdxMenuPositioner
                        >
                            <div
                                class="demo-menu-popup min-w-40! min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                rdxMenuPopup
                            >
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    type="button"
                                    rdxMenuItem
                                >
                                    Back
                                </button>
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    type="button"
                                    rdxMenuItem
                                >
                                    Forward
                                </button>
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    type="button"
                                    rdxMenuItem
                                >
                                    Reload
                                </button>
                            </div>
                        </div>
                    </ng-template>
                </ng-container>
            }
        </div>
    `
})
export class RdxContextMenuSidesComponent {
    protected readonly sides = ['top', 'right', 'bottom', 'left'] as const;
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
