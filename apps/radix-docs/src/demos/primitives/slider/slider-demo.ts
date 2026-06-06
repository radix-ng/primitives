import { Component } from '@angular/core';

import { RdxSliderModule } from '@radix-ng/primitives/slider';

@Component({
    selector: 'radix-slider-demo',
    standalone: true,
    imports: [RdxSliderModule],
    styleUrl: 'slider-demo.css',
    template: `
        <div class="SliderRoot" [value]="45" [step]="5" rdxSliderRoot>
            <div class="SliderControl" rdxSliderControl>
                <div class="SliderTrack" rdxSliderTrack>
                    <div class="SliderIndicator" rdxSliderIndicator></div>
                    <div class="SliderThumb" rdxSliderThumb>
                        <input rdxSliderThumbInput aria-label="Value" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderDemoComponent {}

export default SliderDemoComponent;
