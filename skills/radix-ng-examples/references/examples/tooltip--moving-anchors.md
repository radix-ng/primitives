# Tooltip — Moving anchors

> One example from the [Tooltip](../components/tooltip.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

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
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { demoTooltip } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-slider',
    imports: [
        ...tooltipImports,
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
                <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                    <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>

                    <ng-container [open]="showTooltipState()" rdxTooltip disabled>
                        <div
                            class="border-border bg-background focus-within:ring-ring focus-within:ring-offset-background block size-5 rounded-full border shadow-sm focus-within:ring-2 focus-within:ring-offset-2"
                            [rdxOnPointerDown]="handlePointerDown"
                            rdxSliderThumb
                            rdxTooltipTrigger
                        >
                            <input rdxSliderThumbInput aria-label="Volume" />
                        </div>

                        <div
                            *rdxTooltipPortal
                            [class]="t.positioner"
                            sideOffset="8"
                            side="top"
                            updatePositionStrategy="always"
                            rdxTooltipPositioner
                        >
                            <div [class]="t.popup" rdxTooltipPopup>Volume</div>
                        </div>
                    </ng-container>
                </div>
            </div>
        </div>
    `
})
export class RdxTooltipSliderComponent {
    protected readonly t = demoTooltip;

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
