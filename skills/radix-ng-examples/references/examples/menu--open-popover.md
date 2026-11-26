# Menu — Open Popover

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Set Popover's `open` from an item's `onSelect` and keep its Root outside the closing Menu portal.
Use a persistent anchor, such as the Menu trigger, so positioning stays valid after the item is
removed or hidden. Keep mounted and Defer menu exit demonstrate focus staying in the editor
through Menu completion.

```typescript
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger,
    type RdxMenuOpenChange
} from '@radix-ng/primitives/menu';
import {
    RdxPopoverArrow,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle
} from '@radix-ng/primitives/popover';

@Component({
    selector: 'rdx-menu-open-popover',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxPopoverRoot,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverArrow,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="grid gap-4">
            <div class="flex flex-wrap gap-4 text-sm">
                <label class="flex items-center gap-2">
                    <input [checked]="keep()" (change)="keep.set($any($event.target).checked)" type="checkbox" />
                    Keep mounted
                </label>
                <label class="flex items-center gap-2">
                    <input [checked]="defer()" (change)="defer.set($any($event.target).checked)" type="checkbox" />
                    Defer menu exit
                </label>
            </div>
            <ng-container (onOpenChange)="change($event)" (onOpenChangeComplete)="complete($event)" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 w-fit px-4" #anchor rdxMenuTrigger>
                    Document actions
                </button>
                <ng-template [keepMounted]="keep()" rdxMenuPortal>
                    <div class="z-50 data-[closed]:pointer-events-none" align="start" sideOffset="4" rdxMenuPositioner>
                        <div
                            class="demo-menu-popup data-[open]:animate-popover-popup-in data-[closed]:animate-popover-popup-out w-56 min-w-[8rem] origin-[var(--transform-origin)] p-1 data-[closed]:pointer-events-none data-[closed]:block! data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                (onSelect)="editor.set(true)"
                                rdxMenuItem
                            >
                                Rename document…
                            </button>
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                rdxMenuItem
                            >
                                Duplicate
                            </button>
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                rdxMenuItem
                            >
                                Archive
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <output class="text-muted-foreground text-sm">
                Menu completed: {{ completed().join(' → ') || 'none' }}
            </output>
            <ng-container [(open)]="editor" rdxPopoverRoot>
                <ng-template rdxPopoverPortal>
                    <div class="z-50" [anchor]="anchor" side="right" align="start" sideOffset="8" rdxPopoverPositioner>
                        <div class="demo-popup relative grid w-80 gap-4 p-4" rdxPopoverPopup>
                            <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                            <h2 class="demo-popover-title" rdxPopoverTitle>Rename document</h2>
                            <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                                The editor stays beside Document actions after the menu closes.
                            </p>
                            <div class="grid gap-2">
                                <label class="text-sm font-medium" [for]="nameId">Document name</label>
                                <input class="demo-input h-9 w-full px-3" [id]="nameId" value="Project notes" />
                            </div>
                            <div class="flex flex-wrap justify-end gap-2">
                                @if (defer()) {
                                    <button
                                        class="demo-button demo-button-ghost h-8 px-3 text-xs"
                                        (click)="finishMenuExit()"
                                        type="button"
                                    >
                                        Finish menu exit
                                    </button>
                                }
                                <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxPopoverClose>
                                    Cancel
                                </button>
                                <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxPopoverClose>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </section>
    `
})
export class RdxMenuOpenPopoverComponent {
    protected readonly nameId = injectId('rdx-menu-popover-name-');
    protected readonly keep = signal(false);
    protected readonly defer = signal(false);
    protected readonly editor = signal(false);
    protected readonly completed = signal<string[]>([]);
    private readonly menu = viewChild(RdxMenuRoot);
    protected change(change: RdxMenuOpenChange) {
        if (!change.open && this.defer()) change.eventDetails.preventUnmountOnClose();
    }
    protected complete(open: boolean) {
        this.completed.update((values) => [...values, open ? 'open' : 'closed']);
    }
    protected finishMenuExit() {
        this.menu()?.unmount();
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
