import { demoTooltip } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

            <div *rdxTooltipPortal sideOffset="12" rdxTooltipPositioner [class]="t.positioner">
                <div rdxTooltipPopup [class]="t.popup">Following the cursor</div>
            </div>
        </ng-container>
    `
})
export class RdxTooltipTrackCursorComponent {
    protected readonly t = demoTooltip;
}
