import { Directive } from '@angular/core';
import { injectSliderRootContext } from './slider-context';
import { sliderPartStateAttributes } from './slider-state-attributes';

/**
 * The track of the slider — the positioning context for the indicator and thumbs.
 *
 * @see https://base-ui.com/react/components/slider
 */
@Directive({
    selector: 'div[rdxSliderTrack]',
    exportAs: 'rdxSliderTrack',
    host: {
        style: 'position: relative;',
        ...sliderPartStateAttributes
    }
})
export class RdxSliderTrack {
    protected readonly root = injectSliderRootContext();
}
