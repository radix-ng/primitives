import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxDrawerBackdrop,
    RdxDrawerClose,
    RdxDrawerContent,
    RdxDrawerDescription,
    RdxDrawerPopup,
    RdxDrawerPortal,
    RdxDrawerRoot,
    RdxDrawerSwipeArea,
    RdxDrawerTitle,
    RdxDrawerViewport
} from '@radix-ng/primitives/drawer';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-swipe-to-open',
    imports: [
        RdxDrawerRoot,
        RdxDrawerSwipeArea,
        RdxDrawerPortal,
        RdxDrawerBackdrop,
        RdxDrawerViewport,
        RdxDrawerPopup,
        RdxDrawerContent,
        RdxDrawerTitle,
        RdxDrawerDescription,
        RdxDrawerClose
    ],
    template: `
        <div
            class="border-border bg-background text-foreground relative min-h-80 w-full max-w-2xl overflow-hidden border"
            #portalContainer
        >
            <div [modal]="false" swipeDirection="right" rdxDrawerRoot>
                <div
                    class="border-primary bg-primary/10 absolute inset-y-0 right-0 z-[1] w-10 cursor-grab border-l-2 border-dashed data-[swiping]:cursor-grabbing"
                    rdxDrawerSwipeArea
                >
                    <span
                        class="text-primary pointer-events-none absolute top-1/2 right-0 z-0 mr-2 origin-center -translate-y-1/2 -rotate-90 text-xs font-bold tracking-[0.12em] whitespace-nowrap uppercase"
                    >
                        Swipe here
                    </span>
                </div>

                <div class="flex min-h-80 flex-col items-center justify-center gap-3 p-4 pr-16 text-center">
                    <p class="text-muted-foreground text-sm">Swipe from the right edge to open the drawer.</p>
                </div>

                <ng-template [container]="portalContainer" rdxDrawerPortal>
                    <div
                        class="bg-foreground/20 ease-demo-drawer-swipe absolute inset-0 opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-(--duration-demo-drawer-swipe) data-[closed]:opacity-0 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
                        rdxDrawerBackdrop
                    ></div>

                    <div class="absolute inset-0 z-20 flex items-stretch justify-end" rdxDrawerViewport>
                        <div
                            class="border-border bg-card text-card-foreground h-full w-80 max-w-[calc(100%-3rem)] [transform:translateX(var(--drawer-swipe-movement-x))] overflow-y-auto border-l p-6 shadow-lg outline-none [--drawer-swipe-movement-x:0px] [transition:var(--transition-demo-drawer-swipe)] data-[ending-style]:[transform:translateX(100%)] data-[starting-style]:[transform:translateX(100%)] data-[swiping]:select-none data-[swiping]:[transition:none]"
                            rdxDrawerPopup
                        >
                            <div class="mx-auto w-full max-w-lg" rdxDrawerContent>
                                <h2 class="demo-dialog-title" rdxDrawerTitle>Library</h2>
                                <p class="text-muted-foreground mt-1.5 text-sm" rdxDrawerDescription>
                                    Swipe from the edge whenever you want to jump back into your playlists.
                                </p>
                                <div class="mt-6 flex justify-end gap-2">
                                    <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxDrawerClose>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerSwipeToOpenComponent {}
