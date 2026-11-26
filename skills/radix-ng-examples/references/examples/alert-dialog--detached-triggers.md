# Alert Dialog — Detached triggers

> One example from the [Alert Dialog](../components/alert-dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Connect a trigger rendered outside the root with `createRdxAlertDialogHandle()`; the handle also exposes
imperative `open(id)` / `close()`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAlertDialogBackdrop,
    RdxAlertDialogClose,
    RdxAlertDialogDescription,
    RdxAlertDialogPopup,
    RdxAlertDialogPortal,
    RdxAlertDialogRoot,
    RdxAlertDialogTitle,
    RdxAlertDialogTrigger,
    createRdxAlertDialogHandle
} from '@radix-ng/primitives/alert-dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-detached',
    imports: [
        RdxAlertDialogRoot,
        RdxAlertDialogTrigger,
        RdxAlertDialogPortal,
        RdxAlertDialogBackdrop,
        RdxAlertDialogPopup,
        RdxAlertDialogTitle,
        RdxAlertDialogDescription,
        RdxAlertDialogClose
    ],
    template: `
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <button
                class="demo-button demo-button-destructive h-9 px-4"
                id="delete"
                [handle]="handle"
                rdxAlertDialogTrigger
            >
                Delete file
            </button>

            <button class="demo-button demo-button-secondary h-8 px-3 text-xs" (click)="handle.open('delete')">
                Open imperatively
            </button>

            <div [handle]="handle" rdxAlertDialogRoot>
                <ng-template rdxAlertDialogPortal>
                    <div
                        class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                        rdxAlertDialogBackdrop
                    ></div>
                    <div
                        class="demo-popup data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxAlertDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxAlertDialogTitle>Delete this file?</h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxAlertDialogDescription>
                            The trigger and this alert dialog are connected with
                            <code>createRdxAlertDialogHandle()</code>
                            .
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
        </div>
    `
})
export class RdxAlertDialogDetachedComponent {
    protected readonly handle = createRdxAlertDialogHandle();
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
