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
    selector: 'slider-default-example',
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div class="relative w-56 select-none" [value]="45" [step]="5" rdxSliderRoot>
            <div class="flex w-full touch-none items-center py-3" rdxSliderControl>
                <div class="relative h-1 w-full bg-neutral-200 dark:bg-neutral-800" rdxSliderTrack>
                    <div class="bg-primary h-full" rdxSliderIndicator></div>
                    <div
                        class="border-foreground bg-background has-focus-visible:outline-ring block size-4 border has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput aria-label="Value" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderDefaultExample {}
