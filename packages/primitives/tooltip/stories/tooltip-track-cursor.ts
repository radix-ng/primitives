import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxTooltip,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-track-cursor',
    imports: [RdxTooltip, RdxTooltipPopup, RdxTooltipPortal, RdxTooltipPositioner, RdxTooltipTrigger],
    template: `
        <ng-container rdxTooltip trackCursorAxis="both">
            <button
                class="border-border bg-background text-foreground hover:bg-muted flex h-24 w-64 items-center justify-center rounded-md border text-sm shadow-sm outline-none"
                type="button"
                rdxTooltipTrigger
            >
                Move the cursor over me
            </button>

            <div class="z-50" *rdxTooltipPortal sideOffset="12" rdxTooltipPositioner>
                <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>Following the cursor</div>
            </div>
        </ng-container>
    `
})
export class RdxTooltipTrackCursorComponent {}
