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
import { DemoPage } from '../shared/demo-page';

@Component({
    selector: 'app-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DemoPage,
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
        <demo-page
            title="Dialog"
            description="A modal window overlaid on the page, rendered in a portal, that traps focus until dismissed."
        >
            <div rdxDialogRoot>
                <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Edit profile</button>

                <ng-template rdxDialogPortal>
                    <div
                        class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                        rdxDialogBackdrop
                    ></div>

                    <div
                        class="demo-surface data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxDialogTitle>Edit profile</h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                            Make changes to your profile here. Click save when you're done.
                        </p>

                        <label class="demo-label mt-4 grid gap-1.5">
                            Name
                            <input class="demo-input h-9 w-full px-3" value="Pedro Duarte" />
                        </label>
                        <label class="demo-label mt-4 grid gap-1.5">
                            Username
                            <input class="demo-input h-9 w-full px-3" value="@peduarte" />
                        </label>

                        <div class="mt-6 flex justify-end gap-2">
                            <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxDialogClose>
                                Cancel
                            </button>
                            <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDialogClose>
                                Save changes
                            </button>
                        </div>

                        <button
                            class="demo-button demo-button-ghost absolute top-3 right-3 size-7 p-0"
                            aria-label="Close"
                            rdxDialogClose
                        >
                            <svg aria-hidden="true" lucideX size="16"></svg>
                        </button>
                    </div>
                </ng-template>
            </div>
        </demo-page>
    `
})
export default class DialogPage {}
