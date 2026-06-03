import { injectSliderRootContext } from './slider-context';
import { Directive } from '@angular/core';

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
        '[attr.data-orientation]': 'root.orientation()',
        '[attr.data-disabled]': 'root.isDisabled() ? "" : undefined',
        '[attr.data-dragging]': 'root.dragging() ? "" : undefined'
    }
})
export class RdxSliderTrack {
    protected readonly root = injectSliderRootContext();
}
