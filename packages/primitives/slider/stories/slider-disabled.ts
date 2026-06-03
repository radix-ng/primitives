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
    selector: 'slider-disabled-example',
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div class="relative w-56 select-none data-[disabled]:opacity-50" rdxSliderRoot disabled [value]="45">
            <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                    <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                    <div class="border-border bg-background block size-5 rounded-full border shadow-sm" rdxSliderThumb>
                        <input rdxSliderThumbInput aria-label="Value" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderDisabledExample {}
