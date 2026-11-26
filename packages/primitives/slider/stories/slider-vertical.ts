import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack
} from '@radix-ng/primitives/slider';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'slider-vertical-example',
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div class="relative h-56 w-5 select-none" [defaultValue]="45" [step]="5" rdxSliderRoot orientation="vertical">
            <div class="flex h-full w-5 touch-none justify-center" rdxSliderControl>
                <div class="relative h-full w-1 bg-neutral-200 dark:bg-neutral-800" rdxSliderTrack>
                    <div class="bg-primary w-full" rdxSliderIndicator></div>
                    <div
                        class="border-border bg-background focus-within:ring-ring block size-5 border focus-within:ring-2"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput aria-label="Value" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderVerticalExample {}
