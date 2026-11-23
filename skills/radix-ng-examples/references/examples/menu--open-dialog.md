# Menu — Open Dialog

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Compose `rdxMenuItem` and `rdxDialogTrigger` on the same native button. A Dialog handle connects
the item to a Root outside the menu portal, so closing Menu does not destroy Dialog. Menu's normal
selection closes the menu chain while Dialog receives focus. After Dialog closes, focus returns to
the surviving menu trigger, including when Menu's item remains mounted but hidden.

To keep Menu open behind Dialog, place Dialog Root and its trigger inside Menu's popup and set
`[closeOnClick]="false"` on the composed item. Dialog then closes first and returns focus to that item.

```typescript
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import {
    createRdxDialogHandle,
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger,
    type RdxMenuOpenChange
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-open-dialog',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose
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
                <button class="demo-button demo-button-outline h-9 w-fit px-4" rdxMenuTrigger>Document actions</button>
                <ng-template [keepMounted]="keep()" rdxMenuPortal>
                    <div class="z-50 data-[closed]:pointer-events-none" align="start" sideOffset="4" rdxMenuPositioner>
                        <div
                            class="demo-menu-popup data-[open]:animate-popover-popup-in data-[closed]:animate-popover-popup-out w-56 min-w-[8rem] origin-[var(--transform-origin)] p-1 data-[closed]:pointer-events-none data-[closed]:block! data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                [handle]="dialog"
                                rdxMenuItem
                                rdxDialogTrigger
                            >
                                Rename document…
                            </button>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                rdxMenuItem
                            >
                                Duplicate
                            </button>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
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
            <ng-container [handle]="dialog" rdxDialogRoot>
                <ng-template rdxDialogPortal>
                    <div class="bg-foreground/50 fixed inset-0 z-50" rdxDialogBackdrop></div>
                    <div
                        class="demo-surface fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxDialogTitle>Rename document</h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                            Focus stays in this dialog while the menu finishes closing.
                        </p>
                        <label class="demo-label mt-4 grid gap-1.5" [for]="nameId">Document name</label>
                        <input class="demo-input h-9 w-full px-3" [id]="nameId" value="Project notes" />
                        <div class="mt-6 flex justify-end gap-2">
                            @if (defer()) {
                                <button
                                    class="demo-button demo-button-ghost h-8 px-3 text-xs"
                                    (click)="finishMenuExit()"
                                >
                                    Finish menu exit
                                </button>
                            }
                            <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxDialogClose>
                                Cancel
                            </button>
                            <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDialogClose>
                                Save
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </section>
    `
})
export class RdxMenuOpenDialogComponent {
    protected readonly nameId = injectId('rdx-menu-document-name-');
    protected readonly dialog = createRdxDialogHandle();
    protected readonly keep = signal(false);
    protected readonly defer = signal(false);
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
