import { Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { LucideAngularModule } from 'lucide-angular';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    selector: 'rdx-tooltip-default',
    imports: [...tooltipImports, LucideAngularModule],
    template: `
        <ng-container rdxTooltip>
            <button [class]="cn(b.base, b.outline, b.size.icon)" aria-label="Add to library" rdxTooltipTrigger>
                <lucide-angular aria-hidden="true" name="plus" size="16" />
            </button>

            <div [container]="content" rdxTooltipPortal>
                <ng-template #content rdxTooltipPortalPresence>
                    <div [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                        <div [class]="t.popup" rdxTooltipPopup>Add to library</div>
                        <span [class]="t.arrow" rdxTooltipArrow></span>
                    </div>
                </ng-template>
            </div>
        </ng-container>
    `
})
export class RdxTooltipDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;
}
