# Alert Dialog — Multiple triggers

> One example from the [Alert Dialog](../components/alert-dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Several triggers can open the same alert dialog. The active trigger's `payload` is exposed on the root
so the content can adapt to what is being confirmed.

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
    RdxAlertDialogTrigger
} from '@radix-ng/primitives/alert-dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-multiple-triggers',
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
        <div #root="rdxAlertDialogRoot" rdxAlertDialogRoot>
            <div class="flex gap-2">
                <button class="demo-button demo-button-outline h-9 px-4" payload="photo" rdxAlertDialogTrigger>
                    Delete photo
                </button>
                <button class="demo-button demo-button-outline h-9 px-4" payload="video" rdxAlertDialogTrigger>
                    Delete video
                </button>
                <button class="demo-button demo-button-outline h-9 px-4" payload="album" rdxAlertDialogTrigger>
                    Delete album
                </button>
            </div>

            <ng-template rdxAlertDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxAlertDialogBackdrop
                ></div>
                <div
                    class="demo-popup data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxAlertDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxAlertDialogTitle>Delete this {{ root.payload() || 'item' }}?</h2>
                    <p class="text-muted-foreground mt-1.5 text-sm" rdxAlertDialogDescription>
                        Every trigger opens the same alert dialog; the active trigger's
                        <code>payload</code>
                        decides what is being deleted.
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
export class RdxAlertDialogMultipleTriggersComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
