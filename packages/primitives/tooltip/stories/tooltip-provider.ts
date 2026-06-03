import { cn, demoButton, demoTooltip } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { tooltipImports } from '@radix-ng/primitives/tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-provider',
    imports: [...tooltipImports, LucideDynamicIcon],
    template: `
        <div class="flex items-center gap-2" rdxTooltipProvider [delay]="600" [timeout]="400">
            @for (action of actions; track action.name) {
                <ng-container rdxTooltip>
                    <button
                        rdxTooltipTrigger
                        [class]="cn(b.base, b.outline, b.size.icon)"
                        [attr.aria-label]="action.name"
                    >
                        <svg aria-hidden="true" size="16" [lucideIcon]="action.icon" />
                    </button>

                    <div *rdxTooltipPortal sideOffset="8" rdxTooltipPositioner [class]="t.positioner">
                        <div rdxTooltipPopup [class]="t.popup">{{ action.name }}</div>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipProviderComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;

    protected readonly actions = [
        { name: 'Bold', icon: 'bold' },
        { name: 'Italic', icon: 'italic' },
        { name: 'Add', icon: 'plus' }
    ];
}
