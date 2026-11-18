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
