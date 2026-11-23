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
    selector: 'rdx-dialog-inside-scroll',
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
        <div rdxDialogRoot>
            <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxDialogBackdrop
                ></div>

                <!-- The popup stays fixed on screen; only its body scrolls. -->
                <div
                    class="demo-popup data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxDialogTitle>Release notes</h2>
                    <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                        Header and footer stay put while the body scrolls.
                    </p>

                    <div class="text-muted-foreground mt-4 max-h-[50vh] overflow-y-auto pr-2 text-sm">
                        @for (paragraph of paragraphs; track $index) {
                            <p class="mt-3 first:mt-0">{{ paragraph }}</p>
                        }
                    </div>

                    <div class="mt-6 flex justify-end gap-2">
                        <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDialogClose>Got it</button>
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
export class RdxDialogInsideScrollComponent {
    protected readonly paragraphs = Array.from(
        { length: 14 },
        (_, i) => `Change ${i + 1}. Lots of details that overflow the fixed-height popup and scroll inside it.`
    );
}
