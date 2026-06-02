import { Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { LucideAngularModule } from 'lucide-angular';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    selector: 'rdx-tooltip-provider',
    imports: [...tooltipImports, LucideAngularModule],
    template: `
        <div class="flex items-center gap-2" [delay]="600" [timeout]="400" rdxTooltipProvider>
            @for (action of actions; track action.name) {
                <ng-container rdxTooltip>
                    <button
                        [class]="cn(b.base, b.outline, b.size.icon)"
                        [attr.aria-label]="action.name"
                        rdxTooltipTrigger
                    >
                        <lucide-angular [name]="action.icon" aria-hidden="true" size="16" />
                    </button>

                    <div [container]="content" rdxTooltipPortal>
                        <ng-template #content rdxTooltipPortalPresence>
                            <div [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                                <div [class]="t.popup" rdxTooltipPopup>{{ action.name }}</div>
                            </div>
                        </ng-template>
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
