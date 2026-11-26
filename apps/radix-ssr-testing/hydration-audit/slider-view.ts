import { Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderLabel,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack,
    type RdxSliderThumbAlignment
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
        .control,
        .track {
            position: relative;
            width: 200px;
            height: 20px;
        }
        .thumb {
            width: 20px;
            height: 20px;
        }
    `,
    template: `
        <form>
            @for (alignment of alignments; track alignment) {
                <div [thumbAlignment]="alignment" [defaultValue]="0" [name]="alignment" rdxSliderRoot>
                    <div rdxSliderLabel>Volume {{ alignment }}</div>
                    <div class="control" rdxSliderControl>
                        <div class="track" rdxSliderTrack>
                            <div rdxSliderIndicator></div>
                            <div class="thumb" rdxSliderThumb><input rdxSliderThumbInput /></div>
                        </div>
                    </div>
                </div>
            }
            <button type="reset">Reset volume</button>
        </form>
    `
})
export class SliderAuditView {
    protected readonly alignments: RdxSliderThumbAlignment[] = ['edge', 'edge-client-only'];
}
