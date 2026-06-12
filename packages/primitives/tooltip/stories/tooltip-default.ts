import { Component } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    selector: 'rdx-tooltip-default',
    imports: [...tooltipImports, LucidePlus],
    template: `
        <ng-container rdxTooltip>
            <button [class]="cn(b.base, b.outline, b.size.icon)" aria-label="Add to library" rdxTooltipTrigger>
                <svg aria-hidden="true" lucidePlus size="16" />
            </button>

            <div *rdxTooltipPortal [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                <div [class]="t.popup" rdxTooltipPopup>Add to library</div>
                <span [class]="t.arrow" rdxTooltipArrow></span>
            </div>
        </ng-container>
    `
})
export class RdxTooltipDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;
}
