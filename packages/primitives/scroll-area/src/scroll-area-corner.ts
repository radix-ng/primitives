import { injectScrollAreaRootContext } from './scroll-area-root';
import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/**
 * A small rectangular area that appears at the intersection of horizontal and vertical scrollbars.
 * Renders a `<div>` element.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxScrollAreaCorner]',
    exportAs: 'rdxScrollAreaCorner',
    host: {
        '[style.position]': '"absolute"',
        '[style.bottom]': '"0"',
        '[style.inset-inline-end]': '"0"',
        '[style.width]': 'rootContext.cornerSize().width + "px"',
        '[style.height]': 'rootContext.cornerSize().height + "px"',
        '[style.display]': 'rootContext.hiddenState().corner ? "none" : null'
    }
})
export class RdxScrollAreaCorner {
    protected readonly rootContext = injectScrollAreaRootContext();

    constructor() {
        const element: HTMLElement = inject(ElementRef).nativeElement;
        const destroyRef = inject(DestroyRef);
        this.rootContext.cornerRef.current = element;
        destroyRef.onDestroy(() => {
            if (this.rootContext.cornerRef.current === element) {
                this.rootContext.cornerRef.current = null;
            }
        });
    }
}
