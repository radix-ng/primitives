import { cn, demoButton, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-animated',
    imports: [...popoverImports, LucideX],
    template: `
        <ng-container rdxPopoverRoot>
            <button rdxPopoverTrigger [class]="cn(b.base, b.outline, b.size.md)">Animated popover</button>

            <div *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner [class]="p.positioner">
                <div rdxPopoverPopup [class]="cn(p.popup, p.popupAnimated)">
                    <span rdxPopoverArrow [class]="p.arrow"></span>
                    <h2 rdxPopoverTitle [class]="p.title">Native CSS keyframes</h2>
                    <p rdxPopoverDescription [class]="p.description">
                        Presence keeps this content mounted until the exit animation finishes.
                    </p>
                    <button aria-label="Close" rdxPopoverClose [class]="p.close">
                        <svg aria-hidden="true" lucideX size="14" />
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPopoverAnimatedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
}
