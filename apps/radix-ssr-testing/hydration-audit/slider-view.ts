import { Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderLabel,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack,
    type RdxSliderThumbAlignment,
    type SliderValue
} from '@radix-ng/primitives/slider';

@Component({
    selector: 'audit-slider-view',
    imports: [
        RdxSliderControl,
        RdxSliderIndicator,
        RdxSliderLabel,
        RdxSliderRoot,
        RdxSliderThumb,
        RdxSliderThumbInput,
        RdxSliderTrack
    ],
    styles: `
        .control {
            position: relative;
            width: 200px;
            height: 20px;
        }
        .control[data-orientation='vertical'] {
            width: 20px;
            height: 200px;
        }
        .track {
            width: 100%;
            height: 100%;
        }
        .thumb {
            width: 20px;
            height: 20px;
        }
        .wide {
            width: 40px;
        }
    `,
    template: `
        <form>
            @for (slider of sliders; track slider.name) {
                <div
                    [thumbAlignment]="slider.alignment"
                    [defaultValue]="slider.value"
                    [name]="slider.name"
                    [dir]="slider.dir"
                    [orientation]="slider.orientation"
                    rdxSliderRoot
                >
                    <div rdxSliderLabel>Volume {{ slider.name }}</div>
                    <div class="control" rdxSliderControl>
                        <div class="track" rdxSliderTrack>
                            <div rdxSliderIndicator></div>
                            @for (index of slider.thumbs; track index) {
                                <div class="thumb" [class.wide]="index > 0" [index]="index" rdxSliderThumb>
                                    <input rdxSliderThumbInput />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            }
            <button type="reset">Reset volume</button>
        </form>
    `
})
export class SliderAuditView {
    protected readonly sliders: {
        name: string;
        alignment: RdxSliderThumbAlignment;
        value: SliderValue;
        dir: 'ltr' | 'rtl';
        orientation: 'horizontal' | 'vertical';
        thumbs: number[];
    }[] = [
        { name: 'edge', alignment: 'edge', value: 0, dir: 'ltr', orientation: 'horizontal', thumbs: [0] },
        {
            name: 'edge-client-only',
            alignment: 'edge-client-only',
            value: 0,
            dir: 'ltr',
            orientation: 'horizontal',
            thumbs: [0]
        },
        {
            name: 'edge-rtl-range',
            alignment: 'edge',
            value: [25, 75],
            dir: 'rtl',
            orientation: 'horizontal',
            thumbs: [0, 1]
        },
        { name: 'edge-vertical', alignment: 'edge', value: 80, dir: 'ltr', orientation: 'vertical', thumbs: [0] }
    ];
}
