import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
    selector: 'rdx-popover-animated',
    imports: [...popoverImports, LucideX],
    template: `
        <ng-container rdxPopoverRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>Animated popover</button>

            <ng-template rdxPopoverPortalPresence>
                <div [class]="p.portalAnimated" rdxPopoverPortal>
                    <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                        <div [class]="cn(p.popup, p.popupAnimated)" rdxPopoverPopup>
                            <span [class]="p.arrow" rdxPopoverArrow></span>
                            <h2 [class]="p.title" rdxPopoverTitle>Native CSS keyframes</h2>
                            <p [class]="p.description" rdxPopoverDescription>
                                Presence keeps this portal mounted until the exit animation finishes.
                            </p>
                            <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                                <svg aria-hidden="true" lucideX size="14" />
                            </button>
                        </div>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
export class RdxPopoverAnimatedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
}
