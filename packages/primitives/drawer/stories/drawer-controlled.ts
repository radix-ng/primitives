import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxDrawerBackdrop,
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
    selector: 'rdx-drawer-controlled',
    imports: [
        RdxDrawerRoot,
        RdxDrawerTrigger,
        RdxDrawerPortal,
        RdxDrawerBackdrop,
        RdxDrawerPopup,
        RdxDrawerContent,
        RdxDrawerTitle,
        RdxDrawerDescription
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground text-xs">Drawer is {{ open() ? 'open' : 'closed' }}</p>

            <button class="demo-button demo-button-outline h-8 px-3 text-xs" (click)="open.set(true)">
                Open from outside
            </button>

            <div [(open)]="open" rdxDrawerRoot>
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
                            <h2 class="demo-dialog-title" rdxDrawerTitle>Controlled drawer</h2>
                            <p class="text-muted-foreground mt-1.5 text-sm" rdxDrawerDescription>
                                The open state is owned by the component and bound with
                                <code>[(open)]</code>
                                .
                            </p>

                            <div class="mt-6 flex justify-end gap-2">
                                <button
                                    class="demo-button demo-button-primary h-8 px-3 text-xs"
                                    (click)="open.set(false)"
                                >
                                    Close from outside
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerControlledComponent {
    protected readonly open = signal(false);
}
