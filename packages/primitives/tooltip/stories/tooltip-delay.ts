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
    selector: 'rdx-tooltip-delay',
    imports: [RdxTooltip, RdxTooltipPopup, RdxTooltipPortal, RdxTooltipPositioner, RdxTooltipTrigger],
    template: `
        <div class="flex items-center gap-3">
            @for (item of triggers; track item.delay) {
                <ng-container rdxTooltip>
                    <button class="demo-button demo-button-outline h-9 px-4" [delay]="item.delay" rdxTooltipTrigger>
                        {{ item.label }}
                    </button>

                    <div class="z-50" *rdxTooltipPortal sideOffset="8" rdxTooltipPositioner>
                        <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>
                            Opened after {{ item.delay }} ms
                        </div>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipDelayComponent {
    protected readonly triggers = [
        { label: 'Instant', delay: 0 },
        { label: 'Default', delay: 600 },
        { label: 'Slow', delay: 1200 }
    ];
}
