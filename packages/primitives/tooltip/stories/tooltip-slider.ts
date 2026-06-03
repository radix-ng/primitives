import { demoTooltip } from '../../storybook/styles';
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
        <div class="relative w-52 select-none" rdxSliderRoot [value]="45" [step]="5">
            <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                    <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>

                    <ng-container rdxTooltip disabled [open]="showTooltipState()">
                        <div
                            class="border-border bg-background focus-within:ring-ring focus-within:ring-offset-background block size-5 rounded-full border shadow-sm focus-within:ring-2 focus-within:ring-offset-2"
                            rdxSliderThumb
                            rdxTooltipTrigger
                            [rdxOnPointerDown]="handlePointerDown"
                        >
                            <input rdxSliderThumbInput aria-label="Volume" />
                        </div>

                        <div
                            *rdxTooltipPortal
                            sideOffset="8"
                            side="top"
                            updatePositionStrategy="always"
                            rdxTooltipPositioner
                            [class]="t.positioner"
                        >
                            <div rdxTooltipPopup [class]="t.popup">Volume</div>
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
