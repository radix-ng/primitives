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
    selector: 'rdx-alert-dialog-default',
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
        <div rdxAlertDialogRoot>
            <button class="demo-button demo-button-destructive h-9 px-4" rdxAlertDialogTrigger>Delete account</button>

            <ng-template rdxAlertDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxAlertDialogBackdrop
                ></div>

                <div
                    class="demo-surface data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxAlertDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxAlertDialogTitle>Are you absolutely sure?</h2>
                    <p class="text-muted-foreground mt-1.5 text-sm" rdxAlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data
                        from our servers.
                    </p>

                    <div class="mt-6 flex justify-end gap-2">
                        <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxAlertDialogClose>
                            Cancel
                        </button>
                        <button class="demo-button demo-button-destructive h-8 px-3 text-xs" rdxAlertDialogClose>
                            Yes, delete account
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxAlertDialogDefaultComponent {}
