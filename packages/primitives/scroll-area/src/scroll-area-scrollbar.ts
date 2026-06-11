import { booleanAttribute, computed, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { BooleanInput, createContext } from '@radix-ng/primitives/core';
import { injectScrollAreaRootContext } from './scroll-area-root';
import { getOffset } from './utils';

export type ScrollbarOrientation = 'vertical' | 'horizontal';

export interface ScrollAreaScrollbarContext {
    orientation: () => ScrollbarOrientation;
}

export const [injectScrollAreaScrollbarContext, provideScrollAreaScrollbarContext] =
    createContext<ScrollAreaScrollbarContext>('ScrollAreaScrollbarContext', 'components/scroll-area');

const scrollbarContext = (): ScrollAreaScrollbarContext => {
    const scrollbar = inject(RdxScrollAreaScrollbar);
    return { orientation: () => scrollbar.orientation() };
};

/**
 * A vertical or horizontal scrollbar for the scroll area.
 * Renders a `<div>` element.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxScrollAreaScrollbar]',
    exportAs: 'rdxScrollAreaScrollbar',
    providers: [provideScrollAreaScrollbarContext(scrollbarContext)],
    host: {
        '[attr.data-id]': 'rootContext.rootId + "-scrollbar"',
        '[attr.data-orientation]': 'orientation()',
        '[attr.data-hovering]': 'rootContext.hovering() ? "" : undefined',
        '[attr.data-scrolling]': 'scrolling() ? "" : undefined',
        '[attr.data-has-overflow-x]': '!rootContext.hiddenState().x ? "" : undefined',
        '[attr.data-has-overflow-y]': '!rootContext.hiddenState().y ? "" : undefined',
        '[attr.data-overflow-x-start]': 'rootContext.overflowEdges().xStart ? "" : undefined',
        '[attr.data-overflow-x-end]': 'rootContext.overflowEdges().xEnd ? "" : undefined',
        '[attr.data-overflow-y-start]': 'rootContext.overflowEdges().yStart ? "" : undefined',
        '[attr.data-overflow-y-end]': 'rootContext.overflowEdges().yEnd ? "" : undefined',
        '[style.position]': '"absolute"',
        '[style.touch-action]': '"none"',
        '[style.user-select]': '"none"',
        '[style.display]': 'shouldRender() ? null : "none"',
        '[style.visibility]': 'hideTrackUntilMeasured() ? "hidden" : null',
        '[style.top]': 'orientation() === "vertical" ? "0" : null',
        '[style.bottom]': 'orientation() === "vertical" ? "var(--scroll-area-corner-height)" : "0"',
        '[style.inset-inline-start]': 'orientation() === "horizontal" ? "0" : null',
        '[style.inset-inline-end]': 'orientation() === "vertical" ? "0" : "var(--scroll-area-corner-width)"',
        '[style.--scroll-area-thumb-height]':
            'orientation() === "vertical" ? rootContext.thumbSize().height + "px" : null',
        '[style.--scroll-area-thumb-width]':
            'orientation() === "horizontal" ? rootContext.thumbSize().width + "px" : null',
        '(pointerdown)': 'onPointerDown($event)',
        '(pointerup)': 'rootContext.handlePointerUp($event)',
        '(pointercancel)': 'rootContext.handlePointerUp($event)',
        '(wheel)': 'onWheel($event)'
    }
})
export class RdxScrollAreaScrollbar {
    protected readonly rootContext = injectScrollAreaRootContext();
    private readonly element: HTMLElement = inject(ElementRef).nativeElement;

    /** Whether the scrollbar controls vertical or horizontal scroll. */
    readonly orientation = input<ScrollbarOrientation>('vertical');

    /** Whether to keep the element rendered when the viewport isn't scrollable. */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly scrolling = computed(() =>
        this.orientation() === 'horizontal' ? this.rootContext.scrollingX() : this.rootContext.scrollingY()
    );

    private readonly isHidden = computed(() =>
        this.orientation() === 'vertical' ? this.rootContext.hiddenState().y : this.rootContext.hiddenState().x
    );

    protected readonly shouldRender = computed(() => this.keepMounted() || !this.isHidden());

    protected readonly hideTrackUntilMeasured = computed(
        () => !this.rootContext.hasMeasuredScrollbar() && !this.keepMounted()
    );

    constructor() {
        // Register this element as the vertical or horizontal scrollbar ref.
        // Runs as an effect so the bound `orientation` input is available.
        effect(() => {
            if (this.orientation() === 'vertical') {
                this.rootContext.scrollbarYRef.current = this.element;
            } else {
                this.rootContext.scrollbarXRef.current = this.element;
            }
        });
    }

    onWheel(event: WheelEvent): void {
        const viewportEl = this.rootContext.viewportRef.current;
        if (!viewportEl || event.ctrlKey) {
            return;
        }

        const horizontal = this.orientation() === 'horizontal';
        const delta = horizontal ? event.deltaX : event.deltaY;
        if (delta === 0) {
            return;
        }

        const direction = this.rootContext.direction();
        const maxScroll = horizontal
            ? viewportEl.scrollWidth - viewportEl.clientWidth
            : viewportEl.scrollHeight - viewportEl.clientHeight;
        // RTL horizontal scrolling uses a negative `scrollLeft` range, from 0 to `-maxScroll`.
        const minScroll = horizontal && direction === 'rtl' ? -maxScroll : 0;
        const maxScrollValue = horizontal && direction === 'rtl' ? 0 : maxScroll;
        const scrollValue = horizontal ? viewportEl.scrollLeft : viewportEl.scrollTop;

        // At an edge (or with no overflow), let the wheel chain to the parent/page.
        if ((scrollValue <= minScroll && delta < 0) || (scrollValue >= maxScrollValue && delta > 0)) {
            return;
        }

        event.preventDefault();

        const next = Math.min(maxScrollValue, Math.max(minScroll, scrollValue + delta));
        if (horizontal) {
            viewportEl.scrollLeft = next;
        } else {
            viewportEl.scrollTop = next;
        }

        this.rootContext.handleScroll({ x: viewportEl.scrollLeft, y: viewportEl.scrollTop });
    }

    onPointerDown(event: PointerEvent): void {
        if (event.button !== 0) {
            return;
        }

        const orientation = this.orientation();
        const target = event.target as Node | null;
        const thumb =
            orientation === 'vertical' ? this.rootContext.thumbYRef.current : this.rootContext.thumbXRef.current;

        // Ignore clicks on the thumb itself.
        if (thumb && target && thumb.contains(target)) {
            return;
        }

        const viewportEl = this.rootContext.viewportRef.current;
        if (!viewportEl) {
            return;
        }

        const direction = this.rootContext.direction();

        if (
            orientation === 'vertical' &&
            this.rootContext.thumbYRef.current &&
            this.rootContext.scrollbarYRef.current
        ) {
            const thumbEl = this.rootContext.thumbYRef.current;
            const scrollbarEl = this.rootContext.scrollbarYRef.current;
            const thumbYOffset = getOffset(thumbEl, 'margin', 'y');
            const scrollbarYOffset = getOffset(scrollbarEl, 'padding', 'y');
            const thumbHeight = thumbEl.offsetHeight;
            const trackRectY = scrollbarEl.getBoundingClientRect();
            const clickY = event.clientY - trackRectY.top - thumbHeight / 2 - scrollbarYOffset + thumbYOffset / 2;

            const maxThumbOffsetY = scrollbarEl.offsetHeight - thumbHeight - scrollbarYOffset - thumbYOffset;
            const scrollRatioY = clickY / maxThumbOffsetY;
            viewportEl.scrollTop = scrollRatioY * (viewportEl.scrollHeight - viewportEl.clientHeight);
        }

        if (
            orientation === 'horizontal' &&
            this.rootContext.thumbXRef.current &&
            this.rootContext.scrollbarXRef.current
        ) {
            const thumbEl = this.rootContext.thumbXRef.current;
            const scrollbarEl = this.rootContext.scrollbarXRef.current;
            const thumbXOffset = getOffset(thumbEl, 'margin', 'x');
            const scrollbarXOffset = getOffset(scrollbarEl, 'padding', 'x');
            const thumbWidth = thumbEl.offsetWidth;
            const trackRectX = scrollbarEl.getBoundingClientRect();
            const clickX = event.clientX - trackRectX.left - thumbWidth / 2 - scrollbarXOffset + thumbXOffset / 2;

            const maxThumbOffsetX = scrollbarEl.offsetWidth - thumbWidth - scrollbarXOffset - thumbXOffset;
            const scrollRatioX = clickX / maxThumbOffsetX;
            const scrollRange = viewportEl.scrollWidth - viewportEl.clientWidth;

            let newScrollLeft: number;
            if (direction === 'rtl') {
                newScrollLeft = (1 - scrollRatioX) * scrollRange;
                // Adjust for browsers that use negative scrollLeft in RTL.
                if (viewportEl.scrollLeft <= 0) {
                    newScrollLeft = -newScrollLeft;
                }
            } else {
                newScrollLeft = scrollRatioX * scrollRange;
            }
            viewportEl.scrollLeft = newScrollLeft;
        }

        this.rootContext.handleScroll({ x: viewportEl.scrollLeft, y: viewportEl.scrollTop });
        this.rootContext.handlePointerDown(event);
    }
}
