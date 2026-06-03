import { cn, demoButton, demoTooltip } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { tooltipImports } from '@radix-ng/primitives/tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-default',
    imports: [...tooltipImports, LucidePlus],
    template: `
        <ng-container rdxTooltip>
            <button aria-label="Add to library" rdxTooltipTrigger [class]="cn(b.base, b.outline, b.size.icon)">
                <svg aria-hidden="true" lucidePlus size="16" />
            </button>

            <div *rdxTooltipPortal sideOffset="8" rdxTooltipPositioner [class]="t.positioner">
                <div rdxTooltipPopup [class]="t.popup">Add to library</div>
                <span rdxTooltipArrow [class]="t.arrow"></span>
            </div>
        </ng-container>
    `
})
export class RdxTooltipDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;
}
