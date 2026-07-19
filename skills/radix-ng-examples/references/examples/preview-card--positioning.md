# Preview Card — Positioning

> One example from the [Preview Card](../components/preview-card.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Configure side, offsets, collision behavior, and arrow padding on the positioner.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Side } from '@radix-ng/primitives/popper';
import { previewCardImports } from '@radix-ng/primitives/preview-card';
import { cn, demoButton, demoFocusRing, demoPopover } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-positioning',
    imports: [...previewCardImports],
    template: `
        <div class="grid gap-4">
            <div class="flex flex-wrap gap-2">
                @for (option of sides; track option) {
                    <button
                        [class]="cn(b.base, side() === option ? b.primary : b.outline, b.size.sm)"
                        (click)="side.set(option)"
                        type="button"
                    >
                        {{ option }}
                    </button>
                }
            </div>

            <ng-container rdxPreviewCardRoot>
                <a [class]="link" href="#" rdxPreviewCardTrigger>Hover the positioned preview card</a>

                <div
                    *rdxPreviewCardPortal
                    [class]="p.positioner"
                    [side]="side()"
                    sideOffset="8"
                    rdxPreviewCardPositioner
                >
                    <div [class]="p.popup" rdxPreviewCardPopup>
                        <span [class]="p.arrow" rdxPreviewCardArrow></span>
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
```
