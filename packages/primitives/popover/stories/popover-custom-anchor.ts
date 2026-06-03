import { cn, demoButton, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-custom-anchor',
    imports: [...popoverImports, LucideX],
    template: `
        <div class="flex w-[min(640px,80vw)] flex-col items-center gap-8">
            <ng-container rdxPopoverRoot>
                <button rdxPopoverTrigger [class]="cn(b.base, b.outline, b.size.md)">Open from this button</button>

                <div
                    #customAnchor
                    class="border-primary bg-primary/10 text-foreground flex h-24 w-56 items-center justify-center rounded-lg border border-dashed text-center text-sm font-medium"
                >
                    Popup anchor
                </div>

                <div
                    *rdxPopoverPortal
                    sideOffset="8"
                    rdxPopoverPositioner
                    [class]="p.positioner"
                    [anchor]="customAnchor"
                >
                    <div rdxPopoverPopup [class]="p.popup">
                        <span rdxPopoverArrow [class]="p.arrow"></span>
                        <h2 rdxPopoverTitle [class]="p.title">Custom anchor</h2>
                        <p rdxPopoverDescription [class]="p.description">
                            The trigger controls open state, but the positioner is anchored to the dashed box.
                        </p>
                        <button aria-label="Close" rdxPopoverClose [class]="p.close">
                            <svg aria-hidden="true" lucideX size="14" />
                        </button>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxPopoverCustomAnchorComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
}
