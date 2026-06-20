import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack,
    RdxSliderValue
} from '@radix-ng/primitives/slider';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'slider-value-example',
    imports: [
        RdxSliderRoot,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderThumb,
        RdxSliderThumbInput,
        RdxSliderValue
    ],
    template: `
        <div class="relative w-56 select-none" [value]="42" [format]="format" rdxSliderRoot>
            <div class="text-foreground mb-2 flex items-center justify-between text-sm">
                <span id="slider-value-label">Budget</span>
                <output class="text-muted-foreground tabular-nums" rdxSliderValue></output>
            </div>
            <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                    <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                    <div
                        class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput aria-labelledby="slider-value-label" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderValueExample {
    readonly format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD', maximumFractionDigits: 0 };
}
