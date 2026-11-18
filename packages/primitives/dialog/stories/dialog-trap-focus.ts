import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
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
    selector: 'rdx-dialog-trap-focus',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        LucideX
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                Trap focus: keyboard focus stays inside the dialog (Tab cycles its controls), while page scrolling and
                outside pointer interactions remain available.
            </p>

            <div modal="trap-focus" rdxDialogRoot>
                <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Open dialog</button>

                <ng-template rdxDialogPortal>
                    <div
                        class="demo-surface data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxDialogTitle>Focus is trapped</h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                            Press Tab and notice focus never leaves the dialog.
                        </p>

                        <label class="demo-label mt-4 grid gap-1.5">
                            First field
                            <input class="demo-input h-9 w-full px-3" placeholder="Focused when opened" />
                        </label>
                        <label class="demo-label mt-4 grid gap-1.5">
                            Second field
                            <input class="demo-input h-9 w-full px-3" placeholder="Tab to reach me" />
                        </label>

                        <div class="mt-6 flex justify-end gap-2">
                            <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDialogClose>
                                Done
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

            <button
                class="demo-button demo-button-secondary h-8 px-3 text-xs"
                (click)="outsideClicks.update((count) => count + 1)"
            >
                Outside interaction target: {{ outsideClicks() }}
            </button>
        </div>
    `
})
export class RdxDialogTrapFocusComponent {
    protected readonly outsideClicks = signal(0);
}
