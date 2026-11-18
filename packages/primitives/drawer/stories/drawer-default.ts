import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxDrawerBackdrop,
    RdxDrawerClose,
    RdxDrawerContent,
    RdxDrawerDescription,
    RdxDrawerPopup,
    RdxDrawerPortal,
    RdxDrawerRoot,
    RdxDrawerTitle,
    RdxDrawerTrigger
} from '@radix-ng/primitives/drawer';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-default',
    imports: [
        RdxDrawerRoot,
        RdxDrawerTrigger,
        RdxDrawerPortal,
        RdxDrawerBackdrop,
        RdxDrawerPopup,
        RdxDrawerContent,
        RdxDrawerTitle,
        RdxDrawerDescription,
        RdxDrawerClose,
        LucideX
    ],
    template: `
        <div rdxDrawerRoot>
            <button class="demo-button demo-button-primary h-9 px-4" rdxDrawerTrigger>Open drawer</button>

            <ng-template rdxDrawerPortal>
                <div
                    class="bg-foreground/50 fixed inset-0 z-50 transition-opacity duration-200 data-[closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
                    rdxDrawerBackdrop
                ></div>

                <div
                    class="demo-drawer-popup demo-drawer-side-bottom after:ease fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] origin-top [transform:translate3d(var(--drawer-swipe-movement-x),var(--drawer-swipe-movement-y),0)] flex-col [--drawer-swipe-movement-x:0px] [--drawer-swipe-movement-y:0px] [transition:var(--transition-demo-drawer)] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[calc(3rem+max(0px,calc(-1*var(--drawer-swipe-movement-y))))] after:border-0 after:bg-[inherit] after:transition-[height] after:duration-300 after:content-[''] focus:outline-none data-[closed]:[transform:translateY(100%)] data-[nested-drawer-open]:-translate-y-3 data-[nested-drawer-open]:scale-[0.965] data-[starting-style]:[transform:translateY(100%)] data-[swiping]:[transition:none] data-[swiping]:after:duration-0"
                    rdxDrawerPopup
                >
                    <div class="bg-muted mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full" aria-hidden="true"></div>

                    <div class="overflow-y-auto p-6" rdxDrawerContent>
                        <h2 class="demo-dialog-title" rdxDrawerTitle>Drag me down</h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxDrawerDescription>
                            Swipe the sheet downwards or press Escape to dismiss it. Releasing before the halfway point
                            snaps it back.
                        </p>

                        <p class="text-muted-foreground mt-4 text-sm">
                            The grab handle above is purely visual — the whole panel is draggable. Scrollable regions
                            yield to scrolling until they reach their edge.
                        </p>

                        <div class="mt-6 flex justify-end gap-2">
                            <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxDrawerClose>
                                Cancel
                            </button>
                            <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDrawerClose>
                                Confirm
                            </button>
                        </div>
                    </div>

                    <button
                        class="demo-button demo-button-ghost absolute top-3 right-3 size-7 p-0"
                        aria-label="Close"
                        rdxDrawerClose
                    >
                        <svg aria-hidden="true" lucideX size="16"></svg>
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerDefaultComponent {}
