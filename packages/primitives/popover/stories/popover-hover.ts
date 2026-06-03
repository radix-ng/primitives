import { cn, demoButton, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-hover',
    imports: [...popoverImports, LucideX],
    template: `
        <ng-container rdxPopoverRoot>
            <button openOnHover rdxPopoverTrigger [class]="cn(b.base, b.outline, b.size.md)" [delay]="300">
                Hover for details
            </button>

            <div *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner [class]="p.positioner">
                <div rdxPopoverPopup [class]="p.popup">
                    <span rdxPopoverArrow [class]="p.arrow"></span>
                    <h2 rdxPopoverTitle [class]="p.title">Hover popover</h2>
                    <p rdxPopoverDescription [class]="p.description">
                        Move the pointer into this popup. It remains interactive after leaving the trigger.
                    </p>
                    <button aria-label="Close" rdxPopoverClose [class]="p.close">
                        <svg aria-hidden="true" lucideX size="14" />
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPopoverHoverComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
}
