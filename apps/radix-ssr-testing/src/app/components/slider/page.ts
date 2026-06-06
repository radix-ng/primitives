import { Component, ViewEncapsulation } from '@angular/core';
import { RdxSliderModule } from '@radix-ng/primitives/slider';

@Component({
    selector: 'app-slider',
    imports: [RdxSliderModule],
    styles: `
        .SliderRoot {
            position: relative;
            width: 200px;
        }

        .SliderControl {
            display: flex;
            align-items: center;
            width: 100%;
            height: 20px;
        }

        .SliderTrack {
            position: relative;
            background-color: gray;
            width: 100%;
            height: 3px;
        }

        .SliderIndicator {
            background-color: blue;
            height: 100%;
        }

        .SliderThumb {
            display: block;
            width: 20px;
            height: 20px;
            background-color: blue;
            border-radius: 50%;
        }

        .SliderThumb input {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            opacity: 0;
        }
    `,
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="SliderRoot" [value]="[10, 50]" [step]="1" rdxSliderRoot>
            <div class="SliderControl" rdxSliderControl>
                <div class="SliderTrack" rdxSliderTrack>
                    <div class="SliderIndicator" rdxSliderIndicator></div>
                    <div class="SliderThumb" [index]="0" rdxSliderThumb>
                        <input rdxSliderThumbInput aria-label="Minimum" />
                    </div>
                    <div class="SliderThumb" [index]="1" rdxSliderThumb>
                        <input rdxSliderThumbInput aria-label="Maximum" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export default class Page {}
