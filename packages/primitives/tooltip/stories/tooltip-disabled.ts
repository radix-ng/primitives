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
    selector: 'rdx-tooltip-disabled',
    imports: [RdxTooltip, RdxTooltipPopup, RdxTooltipPortal, RdxTooltipPositioner, RdxTooltipTrigger],
    template: `
        <div class="flex items-center gap-3">
            @for (item of triggers; track item.label) {
                <ng-container rdxTooltip>
                    <button
                        class="demo-button demo-button-outline h-9 px-4"
                        [disabled]="item.disabled"
                        rdxTooltipTrigger
                    >
                        {{ item.label }}
                    </button>

                    <div class="z-50" *rdxTooltipPortal rdxTooltipPositioner>
                        <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>
                            {{ item.label }} tooltip
                        </div>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipDisabledComponent {
    protected readonly triggers = [
        { label: 'Enabled', disabled: false },
        { label: 'Disabled', disabled: true }
    ];
}
