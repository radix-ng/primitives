import { Component, ViewEncapsulation } from '@angular/core';
import { RdxSliderModule } from '@radix-ng/primitives/slider';

@Component({
    selector: 'app-slider',
    imports: [RdxSliderModule],
    styles: `
        .SliderRoot {
            position: relative;
            display: flex;
            align-items: center;
            width: 200px;
            height: 20px;
        }

        .SliderTrack {
            background-color: gray;
            position: relative;
            flex-grow: 1;
            height: 3px;
        }

        .SliderRange {
            background-color: blue;
            position: absolute;
            height: 100%;
        }

        .SliderThumb {
            display: block;
            width: 20px;
            height: 20px;
            background-color: blue;
        }
    `,
    encapsulation: ViewEncapsulation.None,
    template: `
        <rdx-slider [modelValue]="[10, 50]" [step]="1" className="SliderRoot" style="display: flex; width: 200px;">
            <rdx-slider-track class="SliderTrack">
                <rdx-slider-range class="SliderRange" />
            </rdx-slider-track>
            <rdx-slider-thumb class="SliderThumb" />
            <rdx-slider-thumb class="SliderThumb" />
        </rdx-slider>
    `
})
export default class SliderComponent {}
