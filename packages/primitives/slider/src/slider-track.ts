import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
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
        ...sliderPartStateAttributes,
        '[attr.data-rdx-slider-track]': 'root.prehydratingEdge() ? "" : undefined'
    }
})
export class RdxSliderTrack {
    protected readonly root = injectSliderRootContext();

    constructor() {
        const track = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        this.root.trackRef.set(track);
        inject(DestroyRef).onDestroy(() => {
            if (this.root.trackRef() === track) this.root.trackRef.set(null);
        });
    }
}
