# Tooltip — Moving anchors

> One example from the [Tooltip](../components/tooltip.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Tooltip uses `updatePositionStrategy="always"` so it can follow moving triggers — keep that strategy
when the trigger moves continuously, such as a slider thumb being dragged.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack
} from '@radix-ng/primitives/slider';
import {
    RdxTooltip,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-slider',
    imports: [
        RdxTooltip,
        RdxTooltipPopup,
        RdxTooltipPortal,
        RdxTooltipPositioner,
        RdxTooltipTrigger,
        RdxSliderRoot,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderThumb,
        RdxSliderThumbInput
    ],
    template: `
        <div class="relative w-52 select-none" [value]="45" [step]="5" rdxSliderRoot>
            <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                <div class="bg-muted relative h-1 w-full" rdxSliderTrack>
                    <div class="bg-primary h-full" rdxSliderIndicator></div>

                    <ng-container [open]="showTooltipState()" rdxTooltip>
                        <div
                            class="border-border bg-background focus-within:ring-ring focus-within:ring-offset-background block size-5 border focus-within:ring-2 focus-within:ring-offset-2"
                            rdxSliderThumb
                        >
                            <div class="size-full" [rdxOnPointerDown]="handlePointerDown" rdxTooltipTrigger disabled>
                                <input rdxSliderThumbInput aria-label="Volume" />
                            </div>
                        </div>

                        <div
                            class="z-50"
                            *rdxTooltipPortal
                            sideOffset="8"
                            side="top"
                            updatePositionStrategy="always"
                            rdxTooltipPositioner
                        >
                            <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>Volume</div>
                        </div>
                    </ng-container>
                </div>
            </div>
        </div>
    `
})
export class RdxTooltipSliderComponent {
    readonly showTooltipState = signal(false);

    handlePointerDown = () => {
        this.showTooltipState.set(true);

        const handlePointerUp = () => {
            this.showTooltipState.set(false);

            document.removeEventListener('pointerup', handlePointerUp);
        };

        document.addEventListener('pointerup', handlePointerUp);

        return;
    };
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
