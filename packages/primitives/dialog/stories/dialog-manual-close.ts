import { Component, signal } from '@angular/core';
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogOpenChange,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';

@Component({
    selector: 'rdx-dialog-manual-close',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogClose
    ],
    template: `
        <div
            class="flex flex-col items-start gap-3"
            #root="rdxDialogRoot"
            (onOpenChange)="prepareClose($event)"
            (onOpenChangeComplete)="!$event && closing.set(false)"
            rdxDialogRoot
        >
            <label class="text-foreground flex items-center gap-2 text-sm">
                <input #retain [checked]="keepMounted()" (change)="keepMounted.set(retain.checked)" type="checkbox" />
                Keep draft mounted
            </label>
            <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Open editor</button>
            <ng-template [keepMounted]="keepMounted()" rdxDialogPortal>
                <div class="bg-foreground/50 fixed inset-0 z-50" rdxDialogBackdrop></div>
                <div
                    class="demo-surface fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxDialogTitle>Edit draft</h2>
                    <label class="text-foreground flex flex-col gap-1 text-sm">
                        Draft
                        <input class="border-border rounded-md border px-3 py-2" />
                    </label>
                    <div class="mt-6 flex justify-end gap-2">
                        @if (closing()) {
                            <button class="demo-button demo-button-outline h-9 px-4" (click)="root.unmount()">
                                Finish close
                            </button>
                        } @else {
                            <button class="demo-button demo-button-outline h-9 px-4" rdxDialogClose>
                                Close editor
                            </button>
                        }
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogManualCloseComponent {
    protected readonly keepMounted = signal(false);
    protected readonly closing = signal(false);

    protected prepareClose(change: RdxDialogOpenChange): void {
        this.closing.set(!change.open);
        if (!change.open) change.eventDetails.preventUnmountOnClose();
    }
}
