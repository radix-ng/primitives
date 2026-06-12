import { Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { demoTooltip } from '../../storybook/styles';

@Component({
    selector: 'rdx-tooltip-track-cursor',
    imports: [...tooltipImports],
    template: `
        <ng-container rdxTooltip trackCursorAxis="both">
            <button
                class="border-border bg-background text-foreground hover:bg-muted flex h-24 w-64 items-center justify-center rounded-md border text-sm shadow-sm outline-none"
                type="button"
                rdxTooltipTrigger
            >
                Move the cursor over me
            </button>

            <div *rdxTooltipPortal [class]="t.positioner" sideOffset="12" rdxTooltipPositioner>
                <div [class]="t.popup" rdxTooltipPopup>Following the cursor</div>
            </div>
        </ng-container>
    `
})
export class RdxTooltipTrackCursorComponent {
    protected readonly t = demoTooltip;
}
