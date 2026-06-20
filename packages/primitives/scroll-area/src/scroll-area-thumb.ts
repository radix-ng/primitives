import { Directive, effect, ElementRef, inject } from '@angular/core';
import { injectScrollAreaRootContext } from './scroll-area-root';
import { injectScrollAreaScrollbarContext } from './scroll-area-scrollbar';

/**
 * The draggable part of the scrollbar that indicates the current scroll position.
 * Renders a `<div>` element.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxScrollAreaThumb]',
    exportAs: 'rdxScrollAreaThumb',
    host: {
        '[attr.data-orientation]': 'scrollbarContext.orientation()',
        '[attr.data-scrolling]':
            '(scrollbarContext.orientation() === "horizontal" ? rootContext.scrollingX() : rootContext.scrollingY()) ? "" : undefined',
        '[style.visibility]': 'rootContext.hasMeasuredScrollbar() ? null : "hidden"',
        '[style.height]': 'scrollbarContext.orientation() === "vertical" ? "var(--scroll-area-thumb-height)" : null',
        '[style.width]': 'scrollbarContext.orientation() === "horizontal" ? "var(--scroll-area-thumb-width)" : null',
        '(pointerdown)': 'rootContext.handlePointerDown($event)',
        '(pointermove)': 'rootContext.handlePointerMove($event)',
        '(pointerup)': 'endDrag($event)',
        '(pointercancel)': 'endDrag($event)'
    }
})
export class RdxScrollAreaThumb {
    protected readonly rootContext = injectScrollAreaRootContext();
    protected readonly scrollbarContext = injectScrollAreaScrollbarContext();
    private readonly element: HTMLElement = inject(ElementRef).nativeElement;

    constructor() {
        effect((onCleanup) => {
            const ref =
                this.scrollbarContext.orientation() === 'vertical'
                    ? this.rootContext.thumbYRef
                    : this.rootContext.thumbXRef;
            ref.current = this.element;
            onCleanup(() => {
                if (ref.current === this.element) {
                    ref.current = null;
                }
            });
        });
    }

    endDrag(event: PointerEvent): void {
        if (this.scrollbarContext.orientation() === 'vertical') {
            this.rootContext.setScrollingY(false);
        } else {
            this.rootContext.setScrollingX(false);
        }
        this.rootContext.handlePointerUp(event);
    }
}
