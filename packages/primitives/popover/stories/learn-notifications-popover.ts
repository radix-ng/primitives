import { ChangeDetectionStrategy, Component } from '@angular/core';
import { popoverImports } from '@radix-ng/primitives/popover';

/**
 * Final step of the "Build a styled component" Learn tutorial: the bare Popover parts,
 * the styling, and the enter/exit animation all wrapped into one reusable component.
 * The trigger label and the body are projected, so a feature can drop it in without
 * knowing the primitive exists.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'learn-notifications-popover',
    imports: [popoverImports],
    template: `
        <ng-container rdxPopoverRoot>
            <button
                class="border-border bg-background hover:bg-muted data-[open]:bg-muted inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                rdxPopoverTrigger
            >
                <ng-content select="[trigger]" />
            </button>

            <div
                class="data-[open]:animate-popover-in data-[closed]:animate-popover-out z-50"
                *rdxPopoverPortal
                sideOffset="8"
                rdxPopoverPositioner
            >
                <div
                    class="border-border bg-popover text-popover-foreground data-[open]:animate-popover-popup-in data-[closed]:animate-popover-popup-out w-72 rounded-lg border p-4 shadow-md"
                    rdxPopoverPopup
                >
                    <ng-content />
                </div>
            </div>
        </ng-container>
    `
})
export class LearnNotificationsPopover {}
