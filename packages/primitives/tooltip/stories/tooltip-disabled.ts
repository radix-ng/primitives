import { cn, demoButton, demoTooltip } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-disabled',
    imports: [...tooltipImports],
    template: `
        <div class="flex items-center gap-3">
            @for (item of triggers; track item.label) {
                <ng-container rdxTooltip>
                    <button rdxTooltipTrigger [class]="cn(b.base, b.outline, b.size.md)" [disabled]="item.disabled">
                        {{ item.label }}
                    </button>

                    <div *rdxTooltipPortal rdxTooltipPositioner [class]="t.positioner">
                        <div rdxTooltipPopup [class]="t.popup">{{ item.label }} tooltip</div>
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
