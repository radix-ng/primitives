import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import {
    RdxDialogBackdrop,
    RdxDialogDescription,
    RdxDialogOpenChange,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-close-confirmation',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        FormsModule,
        LucideX
    ],
    template: `
        <!-- The editor dialog is controlled so a close request can be intercepted. -->
        <div [(open)]="editorOpen" (onOpenChange)="onEditorOpenChange($event)" rdxDialogRoot>
            <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Edit description</button>

            <ng-template rdxDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxDialogBackdrop
                ></div>

                <div
                    class="demo-popup data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxDialogTitle>Edit description</h2>
                    <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                        Closing with unsaved changes asks for confirmation.
                    </p>

                    <label class="demo-label mt-4 grid gap-1.5">
                        Description
                        <input
                            class="demo-input h-9 w-full px-3"
                            [(ngModel)]="text"
                            placeholder="Type to create changes"
                        />
                    </label>

                    <div class="mt-6 flex justify-end gap-2">
                        <button class="demo-button demo-button-outline h-8 px-3 text-xs" (click)="requestClose()">
                            Cancel
                        </button>
                        <button class="demo-button demo-button-primary h-8 px-3 text-xs" (click)="save()">Save</button>
                    </div>

                    <button
                        class="demo-button demo-button-ghost absolute top-3 right-3 size-7 p-0"
                        (click)="requestClose()"
                        aria-label="Close"
                    >
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>

        <!-- Confirmation dialog, controlled separately. -->
        <div [(open)]="confirmOpen" rdxDialogRoot>
            <ng-template rdxDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxDialogBackdrop
                ></div>
                <div
                    class="demo-popup data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxDialogTitle>Discard changes?</h2>
                    <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>Your edits will be lost.</p>
                    <div class="mt-6 flex justify-end gap-2">
                        <button
                            class="demo-button demo-button-outline h-8 px-3 text-xs"
                            (click)="confirmOpen.set(false)"
                        >
                            Keep editing
                        </button>
                        <button class="demo-button demo-button-destructive h-8 px-3 text-xs" (click)="discard()">
                            Discard
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogCloseConfirmationComponent {
    protected readonly editorOpen = signal(false);
    protected readonly confirmOpen = signal(false);
    protected text = '';

    private get hasChanges() {
        return this.text.trim().length > 0;
    }

    protected onEditorOpenChange(change: RdxDialogOpenChange) {
        // Re-open the editor and ask for confirmation when there are unsaved changes.
        if (!change.open && this.hasChanges) {
            this.editorOpen.set(true);
            this.confirmOpen.set(true);
        }
    }

    protected requestClose() {
        if (this.hasChanges) {
            this.confirmOpen.set(true);
        } else {
            this.editorOpen.set(false);
        }
    }

    protected save() {
        this.text = '';
        this.editorOpen.set(false);
    }

    protected discard() {
        this.text = '';
        this.confirmOpen.set(false);
        this.editorOpen.set(false);
    }
}
