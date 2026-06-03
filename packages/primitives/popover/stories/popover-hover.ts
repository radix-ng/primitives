import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
    selector: 'rdx-popover-hover',
    imports: [...popoverImports, LucideX],
    template: `
        <ng-container rdxPopoverRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" [delay]="300" openOnHover rdxPopoverTrigger>
                Hover for details
            </button>

            <ng-template rdxPopoverPortalPresence>
                <div rdxPopoverPortal>
                    <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                        <div [class]="p.popup" rdxPopoverPopup>
                            <span [class]="p.arrow" rdxPopoverArrow></span>
                            <h2 [class]="p.title" rdxPopoverTitle>Hover popover</h2>
                            <p [class]="p.description" rdxPopoverDescription>
                                Move the pointer into this popup. It remains interactive after leaving the trigger.
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
export class RdxPopoverHoverComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
}
