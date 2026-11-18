import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
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

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-without-dismiss',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        LucideX
    ],
    template: `
        <div [disablePointerDismissal]="true" rdxDialogRoot>
            <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxDialogBackdrop
                ></div>

                <div
                    class="demo-surface data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxDialogTitle>Confirm your choice</h2>
                    <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                        Clicking the backdrop will not close this dialog. Use a button or press Escape instead.
                    </p>

                    <div class="mt-6 flex justify-end gap-2">
                        <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxDialogClose>Cancel</button>
                        <button class="demo-button demo-button-destructive h-8 px-3 text-xs" rdxDialogClose>
                            Delete
                        </button>
                    </div>

                    <button
                        class="demo-button demo-button-ghost absolute top-3 right-3 size-7 p-0"
                        aria-label="Close"
                        rdxDialogClose
                    >
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogWithoutDismissComponent {}
