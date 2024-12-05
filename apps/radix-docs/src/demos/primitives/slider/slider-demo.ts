import { Component } from '@angular/core';

import { RdxSliderModule } from '@radix-ng/primitives/slider';

@Component({
    standalone: true,
    imports: [RdxSliderModule],
    styleUrl: 'slider-demo.css',
    template: `
        <rdx-slider [modelValue]="[45]" [step]="5" className="SliderRoot" style="display: flex; width: 200px;">
            <rdx-slider-track class="SliderTrack">
                <rdx-slider-range class="SliderRange" />
            </rdx-slider-track>
            <rdx-slider-thumb class="SliderThumb" />
        </rdx-slider>
    `
})
export class SliderDemoComponent {}

export default SliderDemoComponent;
