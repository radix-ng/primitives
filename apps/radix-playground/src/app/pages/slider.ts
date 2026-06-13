import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack
} from '@radix-ng/primitives/slider';
import { DemoPage } from '../shared/demo-page';

@Component({
    selector: 'app-slider',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DemoPage,
        RdxSliderRoot,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderThumb,
        RdxSliderThumbInput
    ],
    template: `
        <demo-page title="Slider" description="An input where the user selects a value from within a given range.">
            <div class="relative w-64 select-none" [value]="45" [step]="5" rdxSliderRoot>
                <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                    <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                        <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                        <div
                            class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                            rdxSliderThumb
                        >
                            <input rdxSliderThumbInput aria-label="Value" />
                        </div>
                    </div>
                </div>
            </div>
        </demo-page>
    `
})
export default class SliderPage {}
