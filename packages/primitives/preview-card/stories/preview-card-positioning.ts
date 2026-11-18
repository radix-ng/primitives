import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Side } from '@radix-ng/primitives/popper';
import {
    RdxPreviewCardArrow,
    RdxPreviewCardPopup,
    RdxPreviewCardPortal,
    RdxPreviewCardPositioner,
    RdxPreviewCardRoot,
    RdxPreviewCardTrigger
} from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-positioning',
    imports: [
        RdxPreviewCardRoot,
        RdxPreviewCardTrigger,
        RdxPreviewCardPortal,
        RdxPreviewCardPositioner,
        RdxPreviewCardPopup,
        RdxPreviewCardArrow
    ],
    template: `
        <div class="grid gap-4">
            <div class="flex flex-wrap gap-2">
                @for (option of sides; track option) {
                    <button
                        class="demo-button h-8 px-3 text-xs"
                        [class]="side() === option ? 'demo-button-primary' : 'demo-button-outline'"
                        (click)="side.set(option)"
                        type="button"
                    >
                        {{ option }}
                    </button>
                }
            </div>

            <ng-container rdxPreviewCardRoot>
                <a
                    class="text-primary demo-focus font-medium underline underline-offset-4"
                    href="#"
                    rdxPreviewCardTrigger
                >
                    Hover the positioned preview card
                </a>

                <div class="z-50" *rdxPreviewCardPortal [side]="side()" sideOffset="8" rdxPreviewCardPositioner>
                    <div class="demo-surface relative w-80 p-4" rdxPreviewCardPopup>
                        <span class="text-card demo-arrow my-px" rdxPreviewCardArrow></span>
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
}
