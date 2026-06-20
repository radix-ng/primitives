import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-custom-anchor',
    imports: [...popoverImports, LucideX],
    template: `
        <div class="flex w-[min(640px,80vw)] flex-col items-center gap-8">
            <ng-container rdxPopoverRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>Open from this button</button>

                <div
                    class="border-primary bg-primary/10 text-foreground flex h-24 w-56 items-center justify-center rounded-lg border border-dashed text-center text-sm font-medium"
                    #customAnchor
                >
                    Popup anchor
                </div>

                <div
                    *rdxPopoverPortal
                    [class]="p.positioner"
                    [anchor]="customAnchor"
                    sideOffset="8"
                    rdxPopoverPositioner
                >
                    <div [class]="p.popup" rdxPopoverPopup>
                        <span [class]="p.arrow" rdxPopoverArrow></span>
                        <h2 [class]="p.title" rdxPopoverTitle>Custom anchor</h2>
                        <p [class]="p.description" rdxPopoverDescription>
                            The trigger controls open state, but the positioner is anchored to the dashed box.
                        </p>
                        <button [class]="p.close" aria-label="Close" rdxPopoverClose>
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
