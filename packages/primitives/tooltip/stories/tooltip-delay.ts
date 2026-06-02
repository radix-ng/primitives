import { Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    selector: 'rdx-tooltip-delay',
    imports: [...tooltipImports],
    template: `
        <div class="flex items-center gap-3">
            @for (item of triggers; track item.delay) {
                <ng-container rdxTooltip>
                    <button [class]="cn(b.base, b.outline, b.size.md)" [delay]="item.delay" rdxTooltipTrigger>
                        {{ item.label }}
                    </button>

                    <div [container]="content" rdxTooltipPortal>
                        <ng-template #content rdxTooltipPortalPresence>
                            <div [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                                <div [class]="t.popup" rdxTooltipPopup>Opened after {{ item.delay }} ms</div>
                            </div>
                        </ng-template>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipDelayComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;

    protected readonly triggers = [
        { label: 'Instant', delay: 0 },
        { label: 'Default', delay: 600 },
        { label: 'Slow', delay: 1200 }
    ];
}
