import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
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

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-detached',
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
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <div class="flex gap-2">
                <button
                    class="demo-button demo-button-outline h-9 px-4"
                    id="settings"
                    [handle]="handle"
                    rdxDialogTrigger
                >
                    Settings
                </button>
                <button
                    class="demo-button demo-button-outline h-9 px-4"
                    id="profile"
                    [handle]="handle"
                    rdxDialogTrigger
                >
                    Profile
                </button>
            </div>

            <button class="demo-button demo-button-secondary h-8 px-3 text-xs" (click)="handle.open('profile')">
                Open profile imperatively
            </button>

            <div [handle]="handle" rdxDialogRoot>
                <ng-template rdxDialogPortal>
                    <div
                        class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                        rdxDialogBackdrop
                    ></div>
                    <div
                        class="demo-surface data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxDialogTitle>Detached triggers</h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                            The triggers and this dialog are connected with
                            <code>createRdxDialogHandle()</code>
                            rather than DOM nesting.
                        </p>
                        <div class="mt-6 flex justify-end gap-2">
                            <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDialogClose>
                                Close
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
        </div>
    `
})
export class RdxDialogDetachedComponent {
    protected readonly handle = createRdxDialogHandle();
}
