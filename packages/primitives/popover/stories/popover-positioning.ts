import { cn, demoButton, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { Side } from '@radix-ng/primitives/popper';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
                <button rdxPopoverTrigger [class]="cn(b.base, b.outline, b.size.md)">Open {{ selectedSide() }}</button>

                <div
                    *rdxPopoverPortal
                    sideOffset="8"
                    rdxPopoverPositioner
                    [class]="p.positioner"
                    [side]="selectedSide()"
                >
                    <div rdxPopoverPopup [class]="p.popup">
                        <span rdxPopoverArrow [class]="p.arrow"></span>
                        <h2 rdxPopoverTitle [class]="p.title">Positioned popup</h2>
                        <p rdxPopoverDescription [class]="p.description">
                            The positioner delegates collision handling to the shared Popper primitive.
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
export class RdxPopoverPositioningComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly sides: Side[] = ['top', 'right', 'bottom', 'left'];
    protected readonly selectedSide = signal<Side>('bottom');
}
