import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { Side } from '@radix-ng/primitives/popper';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
    selector: 'rdx-popover-positioning',
    imports: [...popoverImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="flex flex-wrap justify-center gap-2">
                @for (side of sides; track side) {
                    <button
                        [class]="cn(b.base, selectedSide() === side ? b.primary : b.outline, b.size.sm)"
                        (click)="selectedSide.set(side)"
                    >
                        {{ side }}
                    </button>
                }
            </div>

            <ng-container rdxPopoverRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>Open {{ selectedSide() }}</button>

                <ng-template rdxPopoverPortalPresence>
                    <div rdxPopoverPortal>
                        <div [class]="p.positioner" [side]="selectedSide()" sideOffset="8" rdxPopoverPositioner>
                            <div [class]="p.popup" rdxPopoverPopup>
                                <span [class]="p.arrow" rdxPopoverArrow></span>
                                <h2 [class]="p.title" rdxPopoverTitle>Positioned popup</h2>
                                <p [class]="p.description" rdxPopoverDescription>
                                    The positioner delegates collision handling to the shared Popper primitive.
                                </p>
                                <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                                    <svg aria-hidden="true" lucideX size="14" />
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </div>
    `
})
export class RdxPopoverPositioningComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly sides: Side[] = ['top', 'right', 'bottom', 'left'];
    protected readonly selectedSide = signal<Side>('bottom');
}
