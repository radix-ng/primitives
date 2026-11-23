# Menu — Inside Dialog

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Declare Menu inside Dialog's popup so both layers share their floating ancestry across portals.
Escape closes the deepest menu first and returns focus through its triggers. A press on Menu's
modal backdrop closes Menu while keeping Dialog open; a later press can dismiss Dialog itself.
Selecting an item closes its menu chain while preserving Dialog. Keep mounted and Defer menu exit
exercise retained views and explicit completion; Finish menu exit completes a held close.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import {
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
    RdxMenuSubTrigger,
    RdxMenuTrigger,
    type RdxMenuOpenChange
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-in-dialog',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        LucideChevronRight
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container rdxDialogRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxDialogTrigger>Open workspace</button>
            <ng-template rdxDialogPortal>
                <div class="bg-foreground/50 fixed inset-0 z-50" rdxDialogBackdrop></div>
                <div
                    class="demo-surface fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxDialogTitle>Workspace commands</h2>
                    <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                        Escape closes the submenu, menu, then dialog. Each step returns focus to its trigger.
                    </p>
                    <div class="my-5 grid gap-4">
                        <div class="flex flex-wrap gap-4 text-sm">
                            <label class="flex items-center gap-2">
                                <input
                                    [checked]="keep()"
                                    (change)="keep.set($any($event.target).checked)"
                                    type="checkbox"
                                />
                                Keep mounted
                            </label>
                            <label class="flex items-center gap-2">
                                <input
                                    [checked]="defer()"
                                    (change)="defer.set($any($event.target).checked)"
                                    type="checkbox"
                                />
                                Defer menu exit
                            </label>
                        </div>
                        <ng-container
                            #menu="rdxMenuRoot"
                            (onOpenChange)="change($event)"
                            (onOpenChangeComplete)="complete($event)"
                            rdxMenuRoot
                        >
                            <div class="flex flex-wrap gap-2">
                                <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxMenuTrigger>
                                    Actions
                                </button>
                                <button class="demo-button demo-button-ghost h-8 px-3 text-xs" (click)="menu.unmount()">
                                    Finish menu exit
                                </button>
                            </div>
                            <ng-template [keepMounted]="keep()" rdxMenuPortal>
                                <div
                                    class="z-50 data-[closed]:pointer-events-none"
                                    align="start"
                                    sideOffset="4"
                                    rdxMenuPositioner
                                >
                                    <div
                                        class="demo-menu-popup data-[open]:animate-popover-popup-in data-[closed]:animate-popover-popup-out w-56 min-w-[8rem] origin-[var(--transform-origin)] p-1 data-[closed]:pointer-events-none data-[closed]:block! data-[closed]:hidden"
                                        rdxMenuPopup
                                    >
                                        <button
                                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                            (onSelect)="selected.set('Rename')"
                                            rdxMenuItem
                                        >
                                            Rename
                                        </button>
                                        <ng-container rdxMenuRoot>
                                            <button
                                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                rdxMenuSubTrigger
                                            >
                                                Share
                                                <svg class="ms-auto" aria-hidden="true" lucideChevronRight size="16" />
                                            </button>
                                            <ng-template [keepMounted]="keep()" rdxMenuPortal>
                                                <div
                                                    class="z-50 data-[closed]:pointer-events-none"
                                                    side="right"
                                                    align="start"
                                                    sideOffset="4"
                                                    rdxMenuPositioner
                                                >
                                                    <div
                                                        class="demo-menu-popup w-48 min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                                        rdxMenuPopup
                                                    >
                                                        <button
                                                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                            (onSelect)="selected.set('Copy link')"
                                                            rdxMenuItem
                                                        >
                                                            Copy link
                                                        </button>
                                                        <button
                                                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                            (onSelect)="selected.set('Invite member')"
                                                            rdxMenuItem
                                                        >
                                                            Invite member
                                                        </button>
                                                    </div>
                                                </div>
                                            </ng-template>
                                        </ng-container>
                                        <button
                                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                            (onSelect)="selected.set('Archive')"
                                            rdxMenuItem
                                        >
                                            Archive
                                        </button>
                                    </div>
                                </div>
                            </ng-template>
                        </ng-container>
                        <output class="text-muted-foreground text-sm">Selected: {{ selected() }}</output>
                        <output class="text-muted-foreground text-sm">
                            Completed: {{ completed().join(' → ') || 'none' }}
                        </output>
                    </div>
                    <div class="mt-6 flex justify-end gap-2">
                        <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxDialogClose>
                            Close workspace
                        </button>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
export class RdxMenuInDialogComponent {
    protected readonly keep = signal(false);
    protected readonly defer = signal(false);
    protected readonly selected = signal('none');
    protected readonly completed = signal<string[]>([]);
    protected change(change: RdxMenuOpenChange) {
        if (!change.open && this.defer()) change.eventDetails.preventUnmountOnClose();
    }
    protected complete(open: boolean) {
        this.completed.update((values) => [...values, open ? 'open' : 'closed']);
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
