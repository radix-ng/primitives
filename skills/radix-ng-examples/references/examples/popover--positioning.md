# Popover — Positioning

> One example from the [Popover](../components/popover.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Configure `side`, `sideOffset`, `align`, and collision behavior on `rdxPopoverPositioner`. The
shared Popper primitive updates `data-side` and `data-align` after collision handling.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxPopoverArrow,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';
import { Side } from '@radix-ng/primitives/popper';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-positioning',
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverArrow,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose,
        LucideX
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="flex flex-wrap justify-center gap-2">
                @for (side of sides; track side) {
                    <button
                        class="demo-button h-8 px-3 text-xs"
                        [class]="selectedSide() === side ? 'demo-button-primary' : 'demo-button-outline'"
                        (click)="selectedSide.set(side)"
                    >
                        {{ side }}
                    </button>
                }
            </div>

            <ng-container rdxPopoverRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxPopoverTrigger>
                    Open {{ selectedSide() }}
                </button>

                <div class="z-50" *rdxPopoverPortal [side]="selectedSide()" sideOffset="8" rdxPopoverPositioner>
                    <div class="demo-popup relative w-80 p-4" rdxPopoverPopup>
                        <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                        <h2 class="demo-popover-title" rdxPopoverTitle>Positioned popup</h2>
                        <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                            The positioner delegates collision handling to the shared Popper primitive.
                        </p>
                        <button
                            class="demo-button demo-button-ghost absolute top-2 right-2 size-7 p-0"
                            aria-label="Close"
                            rdxPopoverClose
                        >
                            <svg aria-hidden="true" lucideX size="14" />
                        </button>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxPopoverPositioningComponent {
    protected readonly sides: Side[] = ['top', 'right', 'bottom', 'left'];
    protected readonly selectedSide = signal<Side>('bottom');
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
