# Alert Dialog — Open from a menu

> One example from the [Alert Dialog](../components/alert-dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Control the alert dialog's `open` state from a menu item to launch a destructive confirmation from a `Menu`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxAlertDialogBackdrop,
    RdxAlertDialogClose,
    RdxAlertDialogDescription,
    RdxAlertDialogPopup,
    RdxAlertDialogPortal,
    RdxAlertDialogRoot,
    RdxAlertDialogTitle
} from '@radix-ng/primitives/alert-dialog';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-from-menu',
    imports: [
        RdxAlertDialogRoot,
        RdxAlertDialogPortal,
        RdxAlertDialogBackdrop,
        RdxAlertDialogPopup,
        RdxAlertDialogTitle,
        RdxAlertDialogDescription,
        RdxAlertDialogClose,
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator
    ],
    template: `
        <ng-container #menu="rdxMenuRoot" rdxMenuRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Project</button>

            @if (menu.open()) {
                <div class="z-50 data-[closed]:pointer-events-none" sideOffset="4" rdxMenuPositioner>
                    <div
                        class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                        rdxMenuPopup
                    >
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuItem
                        >
                            Rename
                        </button>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuItem
                        >
                            Duplicate
                        </button>
                        <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            (click)="deleteOpen.set(true)"
                            rdxMenuItem
                        >
                            Delete…
                        </button>
                    </div>
                </div>
            }
        </ng-container>

        <!-- Controlled alert dialog opened from the menu item. -->
        <div [(open)]="deleteOpen" rdxAlertDialogRoot>
            <ng-template rdxAlertDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxAlertDialogBackdrop
                ></div>
                <div
                    class="demo-surface data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxAlertDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxAlertDialogTitle>Delete project?</h2>
                    <p class="text-muted-foreground mt-1.5 text-sm" rdxAlertDialogDescription>
                        This permanently deletes the project. Opened by controlling the alert dialog from a menu item.
                    </p>
                    <div class="mt-6 flex justify-end gap-2">
                        <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxAlertDialogClose>
                            Cancel
                        </button>
                        <button class="demo-button demo-button-destructive h-8 px-3 text-xs" rdxAlertDialogClose>
                            Delete
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxAlertDialogFromMenuComponent {
    protected readonly deleteOpen = signal(false);
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
