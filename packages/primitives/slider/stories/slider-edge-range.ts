import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderLabel,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack,
    RdxSliderValue
} from '@radix-ng/primitives/slider';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'slider-edge-range-example',
    imports: [
        RdxSliderRoot,
        RdxSliderLabel,
        RdxSliderValue,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderThumb,
        RdxSliderThumbInput
    ],
    template: `
        <div
            class="grid w-72 max-w-full gap-2 select-none"
            [defaultValue]="[0, 100]"
            [minStepsBetweenValues]="1"
            [format]="format"
            thumbAlignment="edge"
            rdxSliderRoot
        >
            <div class="text-foreground flex items-baseline justify-between gap-3 text-sm">
                <div class="font-medium" rdxSliderLabel>Price range</div>
                <output class="text-muted-foreground tabular-nums" rdxSliderValue></output>
            </div>
            <div class="border-border flex h-10 touch-none items-center border ps-5 pe-2.5" rdxSliderControl>
                <div class="relative h-1 w-full bg-neutral-200 dark:bg-neutral-800" rdxSliderTrack>
                    <div class="bg-primary h-full" rdxSliderIndicator></div>
                    <div
                        class="border-border bg-background focus-within:ring-ring block size-5 border focus-within:ring-2"
                        [index]="0"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput aria-label="Minimum price" />
                    </div>
                    <div
                        class="border-border bg-background focus-within:ring-ring block size-5 border focus-within:ring-2"
                        [index]="1"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput aria-label="Maximum price" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderEdgeRangeExample {
    protected readonly format: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    };
}
