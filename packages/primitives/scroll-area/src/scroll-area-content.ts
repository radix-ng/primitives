import { injectScrollAreaRootContext } from './scroll-area-root';
import { injectScrollAreaViewportContext } from './scroll-area-viewport';
import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/**
 * A container for the content of the scroll area.
 * Renders a `<div>` element.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxScrollAreaContent]',
    exportAs: 'rdxScrollAreaContent',
    host: {
        role: 'presentation',
        '[style.min-width]': '"fit-content"',
        '[attr.data-scrolling]': '(rootContext.scrollingX() || rootContext.scrollingY()) ? "" : undefined',
        '[attr.data-has-overflow-x]': '!rootContext.hiddenState().x ? "" : undefined',
        '[attr.data-has-overflow-y]': '!rootContext.hiddenState().y ? "" : undefined',
        '[attr.data-overflow-x-start]': 'rootContext.overflowEdges().xStart ? "" : undefined',
        '[attr.data-overflow-x-end]': 'rootContext.overflowEdges().xEnd ? "" : undefined',
        '[attr.data-overflow-y-start]': 'rootContext.overflowEdges().yStart ? "" : undefined',
        '[attr.data-overflow-y-end]': 'rootContext.overflowEdges().yEnd ? "" : undefined'
    }
})
export class RdxScrollAreaContent {
    protected readonly rootContext = injectScrollAreaRootContext();
    private readonly viewportContext = injectScrollAreaViewportContext();
    private readonly element: HTMLElement = inject(ElementRef).nativeElement;
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        // Whether the content mounted after the viewport's first measurement; if so the
        // initial ResizeObserver fire is what brings the overflow state in sync.
        const computeOnInitialResize = this.rootContext.hasMeasuredScrollbar();

        afterNextRender(() => {
            if (typeof ResizeObserver === 'undefined') {
                return;
            }

            let hasInitialized = false;
            const resizeObserver = new ResizeObserver(() => {
                if (!hasInitialized) {
                    hasInitialized = true;
                    // ResizeObserver fires once upon observing. Skip that initial call to avoid
                    // double-calculating the thumb position on mount, unless the content mounted
                    // after the viewport's initial measurement.
                    if (!computeOnInitialResize) {
                        return;
                    }
                }
                this.viewportContext.computeThumbPosition();
            });
            resizeObserver.observe(this.element);
            this.destroyRef.onDestroy(() => resizeObserver.disconnect());
        });
    }
}
