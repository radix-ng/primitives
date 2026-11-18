import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import {
    RdxTooltip,
    RdxTooltipArrow,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-default',
    imports: [
        RdxTooltip,
        RdxTooltipArrow,
        RdxTooltipPopup,
        RdxTooltipPortal,
        RdxTooltipPositioner,
        RdxTooltipTrigger,
        LucidePlus
    ],
    template: `
        <ng-container rdxTooltip>
            <button class="demo-button demo-button-outline size-9 p-0" aria-label="Add to library" rdxTooltipTrigger>
                <svg aria-hidden="true" lucidePlus size="16" />
            </button>

            <div class="z-50" *rdxTooltipPortal sideOffset="8" rdxTooltipPositioner>
                <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>Add to library</div>
                <span class="text-popover demo-arrow my-px" rdxTooltipArrow></span>
            </div>
        </ng-container>
    `
})
export class RdxTooltipDefaultComponent {}
