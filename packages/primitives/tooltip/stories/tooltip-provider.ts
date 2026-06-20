import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-provider',
    imports: [...tooltipImports, LucideDynamicIcon],
    template: `
        <div class="flex items-center gap-2" [delay]="600" [timeout]="400" rdxTooltipProvider>
            @for (action of actions; track action.name) {
                <ng-container rdxTooltip>
                    <button
                        [class]="cn(b.base, b.outline, b.size.icon)"
                        [attr.aria-label]="action.name"
                        rdxTooltipTrigger
                    >
                        <svg [lucideIcon]="action.icon" aria-hidden="true" size="16" />
                    </button>

                    <div *rdxTooltipPortal [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                        <div [class]="t.popup" rdxTooltipPopup>{{ action.name }}</div>
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
