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
    selector: 'rdx-popover-hover',
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
        <ng-container rdxPopoverRoot>
            <button class="demo-button demo-button-outline h-9 px-4" [delay]="300" openOnHover rdxPopoverTrigger>
                Hover for details
            </button>

            <div class="z-50" *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner>
                <div class="demo-popup relative w-80 p-4" rdxPopoverPopup>
                    <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                    <h2 class="demo-popover-title" rdxPopoverTitle>Hover popover</h2>
                    <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                        Move the pointer into this popup. It remains interactive after leaving the trigger.
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
    `
})
export class RdxPopoverHoverComponent {}
