import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus, LucideX } from '@lucide/angular';
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
import { DemoPage } from '../shared/demo-page';

@Component({
    selector: 'app-popover',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DemoPage,
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverArrow,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose,
        LucidePlus,
        LucideX
    ],
    template: `
        <demo-page
            title="Popover"
            description="Displays rich content in a portal, anchored to and triggered by a button."
        >
            <ng-container rdxPopoverRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxPopoverTrigger>
                    <svg aria-hidden="true" lucidePlus size="16"></svg>
                    Add details
                </button>

                <div class="z-50" *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner>
                    <div class="demo-surface relative w-80 p-4" rdxPopoverPopup>
                        <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                        <h2 class="demo-popover-title" rdxPopoverTitle>Dimensions</h2>
                        <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                            Set the width and height for the element.
                        </p>

                        <div class="mt-4 grid gap-3">
                            <label class="text-foreground grid gap-1 text-xs font-medium">
                                Width
                                <input class="demo-input h-9 w-full px-3" value="100%" />
                            </label>
                            <label class="text-foreground grid gap-1 text-xs font-medium">
                                Max width
                                <input class="demo-input h-9 w-full px-3" value="300px" />
                            </label>
                        </div>

                        <button
                            class="demo-button demo-button-ghost absolute top-2 right-2 size-7 p-0"
                            aria-label="Close"
                            rdxPopoverClose
                        >
                            <svg aria-hidden="true" lucideX size="14"></svg>
                        </button>
                    </div>
                </div>
            </ng-container>
        </demo-page>
    `
})
export default class PopoverPage {}
