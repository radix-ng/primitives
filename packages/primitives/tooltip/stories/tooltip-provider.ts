import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideBold, LucideDynamicIcon, LucideItalic, LucidePlus } from '@lucide/angular';
import {
    RdxTooltip,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipProvider,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-provider',
    imports: [
        RdxTooltip,
        RdxTooltipPopup,
        RdxTooltipPortal,
        RdxTooltipPositioner,
        RdxTooltipProvider,
        RdxTooltipTrigger,
        LucideDynamicIcon
    ],
    template: `
        <div
            class="border-foreground bg-background flex items-center border"
            [delay]="600"
            [timeout]="400"
            rdxTooltipProvider
        >
            @for (action of actions; track action.name) {
                <ng-container rdxTooltip>
                    <button
                        class="demo-button demo-button-ghost data-popup-open:bg-muted size-8 p-0"
                        [attr.aria-label]="action.name"
                        rdxTooltipTrigger
                    >
                        <svg [lucideIcon]="action.icon" aria-hidden="true" size="16" />
                    </button>

                    <div class="z-50" *rdxTooltipPortal sideOffset="8" rdxTooltipPositioner>
                        <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>
                            {{ action.name }}
                        </div>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipProviderComponent {
    protected readonly actions = [
        { name: 'Bold', icon: LucideBold },
        { name: 'Italic', icon: LucideItalic },
        { name: 'Add', icon: LucidePlus }
    ];
}
