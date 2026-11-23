import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxPopoverArrow,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-custom-anchor',
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverArrow,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose,
        LucideX
    ],
    template: `
        <div class="flex w-[min(640px,80vw)] flex-col items-center gap-8">
            <ng-container rdxPopoverRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxPopoverTrigger>
                    Open from this button
                </button>

                <div
                    class="border-primary bg-primary/10 text-foreground flex h-24 w-56 items-center justify-center rounded-lg border border-dashed text-center text-sm font-medium"
                    #customAnchor
                >
                    Popup anchor
                </div>

                <div class="z-50" *rdxPopoverPortal [anchor]="customAnchor" sideOffset="8" rdxPopoverPositioner>
                    <div class="demo-popup relative w-80 p-4" rdxPopoverPopup>
                        <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                        <h2 class="demo-popover-title" rdxPopoverTitle>Custom anchor</h2>
                        <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                            The trigger controls open state, but the positioner is anchored to the dashed box.
                        </p>
                        <button
                            class="demo-button demo-button-ghost absolute top-2 right-2 size-7 p-0"
                            aria-label="Close"
                            rdxPopoverClose
                        >
                            <svg aria-hidden="true" lucideX size="14" />
                        </button>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxPopoverCustomAnchorComponent {}
