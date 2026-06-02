import { Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    selector: 'rdx-tooltip-disabled',
    imports: [...tooltipImports],
    template: `
        <div class="flex items-center gap-3">
            @for (item of triggers; track item.label) {
                <ng-container rdxTooltip>
                    <button [class]="cn(b.base, b.outline, b.size.md)" [disabled]="item.disabled" rdxTooltipTrigger>
                        {{ item.label }}
                    </button>

                    <div [container]="content" rdxTooltipPortal>
                        <ng-template #content rdxTooltipPortalPresence>
                            <div [class]="t.positioner" rdxTooltipPositioner>
                                <div [class]="t.popup" rdxTooltipPopup>{{ item.label }} tooltip</div>
                            </div>
                        </ng-template>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipDisabledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;

    protected readonly triggers = [
        { label: 'Enabled', disabled: false },
        { label: 'Disabled', disabled: true }
    ];
}
