import { cn, demoButton, demoFocusRing, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Side } from '@radix-ng/primitives/popper';
import { previewCardImports } from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-positioning',
    imports: [...previewCardImports],
    template: `
        <div class="grid gap-4">
            <div class="flex flex-wrap gap-2">
                @for (option of sides; track option) {
                    <button
                        type="button"
                        [class]="cn(b.base, side() === option ? b.primary : b.outline, b.size.sm)"
                        (click)="side.set(option)"
                    >
                        {{ option }}
                    </button>
                }
            </div>

            <ng-container rdxPreviewCardRoot>
                <a href="#" rdxPreviewCardTrigger [class]="link">Hover the positioned preview card</a>

                <div
                    *rdxPreviewCardPortal
                    sideOffset="8"
                    rdxPreviewCardPositioner
                    [class]="p.positioner"
                    [side]="side()"
                >
                    <div rdxPreviewCardPopup [class]="p.popup">
                        <span rdxPreviewCardArrow [class]="p.arrow"></span>
                        <p class="text-muted-foreground text-sm">
                            The positioner exposes placement attributes and CSS variables for styling.
                        </p>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxPreviewCardPositioningComponent {
    protected readonly sides: Side[] = ['top', 'right', 'bottom', 'left'];
    protected readonly side = signal<Side>('bottom');
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly link = cn('font-medium text-primary underline underline-offset-4', demoFocusRing);
}
