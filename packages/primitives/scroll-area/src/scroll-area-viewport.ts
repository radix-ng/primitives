import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    CSP_NONCE,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    PLATFORM_ID
} from '@angular/core';
import { clamp, createContext } from '@radix-ng/primitives/core';
import { MIN_THUMB_SIZE, SCROLL_END_TIMEOUT } from './constants';
import { HiddenState, injectScrollAreaRootContext } from './scroll-area-root';
import { getOffset, injectScrollbarHideStyles, normalizeScrollOffset } from './utils';

export interface ScrollAreaViewportContext {
    /** Re-measures the viewport and repositions the thumbs. Called by the content's ResizeObserver. */
    computeThumbPosition(): void;
}

export const [injectScrollAreaViewportContext, provideScrollAreaViewportContext] =
    createContext<ScrollAreaViewportContext>('ScrollAreaViewportContext', 'components/scroll-area');

const viewportContext = (): ScrollAreaViewportContext => {
    const viewport = inject(RdxScrollAreaViewport);
    return {
        computeThumbPosition: () => viewport.computeThumbPosition()
    };
};

/**
 * The actual scrollable container of the scroll area.
 * Renders a `<div>` element.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxScrollAreaViewport]',
    exportAs: 'rdxScrollAreaViewport',
    providers: [provideScrollAreaViewportContext(viewportContext)],
    host: {
        role: 'presentation',
        '[style.overflow]': '"scroll"',
        '[attr.tabindex]': '(rootContext.hiddenState().x && rootContext.hiddenState().y) ? -1 : 0',
        '[attr.data-id]': 'rootContext.rootId + "-viewport"',
        '[attr.data-scrolling]': '(rootContext.scrollingX() || rootContext.scrollingY()) ? "" : undefined',
        '[attr.data-has-overflow-x]': '!rootContext.hiddenState().x ? "" : undefined',
        '[attr.data-has-overflow-y]': '!rootContext.hiddenState().y ? "" : undefined',
        '[attr.data-overflow-x-start]': 'rootContext.overflowEdges().xStart ? "" : undefined',
        '[attr.data-overflow-x-end]': 'rootContext.overflowEdges().xEnd ? "" : undefined',
        '[attr.data-overflow-y-start]': 'rootContext.overflowEdges().yStart ? "" : undefined',
        '[attr.data-overflow-y-end]': 'rootContext.overflowEdges().yEnd ? "" : undefined',
        '(scroll)': 'onScroll()',
        '(wheel)': 'onUserInteraction()',
        '(pointermove)': 'onUserInteraction()',
        '(pointerenter)': 'onUserInteraction()',
        '(keydown)': 'onUserInteraction()'
    }
})
export class RdxScrollAreaViewport {
    protected readonly rootContext = injectScrollAreaRootContext();

    private readonly element: HTMLElement = inject(ElementRef).nativeElement;
    private readonly destroyRef = inject(DestroyRef);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly cspNonce = inject(CSP_NONCE, { optional: true });

    private programmaticScroll = true;
    private lastMeasuredMetrics: [number, number, number, number] = [NaN, NaN, NaN, NaN];
    private scrollEndTimer: ReturnType<typeof setTimeout> | undefined;
    private animationsTimer: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        this.rootContext.viewportRef.current = this.element;

        if (this.isBrowser) {
            effect(() => {
                if (!this.rootContext.disableStyleElements()) {
                    injectScrollbarHideStyles(this.element.ownerDocument, this.cspNonce);
                }
            });
        }

        // Recompute after hidden-state toggles (so newly shown scrollbars get measured),
        // on direction flips, and when the overflow-edge threshold changes.
        const hiddenState = this.rootContext.hiddenState;
        const direction = this.rootContext.direction;
        const threshold = this.rootContext.overflowEdgeThreshold;
        effect(() => {
            hiddenState();
            direction();
            threshold();
            queueMicrotask(() => this.computeThumbPosition());
        });

        afterNextRender(() => {
            this.computeThumbPosition();
            this.observeViewport();

            if (this.element.matches(':hover')) {
                this.rootContext.setHovering(true);
            }
        });

        this.destroyRef.onDestroy(() => {
            if (this.rootContext.viewportRef.current === this.element) {
                this.rootContext.viewportRef.current = null;
            }
            clearTimeout(this.scrollEndTimer);
            clearTimeout(this.animationsTimer);
        });
    }

    computeThumbPosition(): void {
        const viewportEl = this.rootContext.viewportRef.current;
        const scrollbarYEl = this.rootContext.scrollbarYRef.current;
        const scrollbarXEl = this.rootContext.scrollbarXRef.current;
        const thumbYEl = this.rootContext.thumbYRef.current;
        const thumbXEl = this.rootContext.thumbXRef.current;
        const cornerEl = this.rootContext.cornerRef.current;

        if (!viewportEl) {
            return;
        }

        const direction = this.rootContext.direction();
        const threshold = this.rootContext.overflowEdgeThreshold();
        const cornerSize = this.rootContext.cornerSize();

        const scrollableContentHeight = viewportEl.scrollHeight;
        const scrollableContentWidth = viewportEl.scrollWidth;
        const viewportHeight = viewportEl.clientHeight;
        const viewportWidth = viewportEl.clientWidth;
        const scrollTop = viewportEl.scrollTop;
        const scrollLeft = viewportEl.scrollLeft;

        const isFirstMeasurement = Number.isNaN(this.lastMeasuredMetrics[0]);
        this.lastMeasuredMetrics = [viewportHeight, scrollableContentHeight, viewportWidth, scrollableContentWidth];

        if (isFirstMeasurement) {
            this.rootContext.setHasMeasuredScrollbar(true);
        }

        if (scrollableContentHeight === 0 || scrollableContentWidth === 0) {
            return;
        }

        const nextHiddenState = getHiddenState(viewportEl);
        const scrollbarYHidden = nextHiddenState.y;
        const scrollbarXHidden = nextHiddenState.x;
        const ratioX = viewportWidth / scrollableContentWidth;
        const ratioY = viewportHeight / scrollableContentHeight;
        const maxScrollLeft = Math.max(0, scrollableContentWidth - viewportWidth);
        const maxScrollTop = Math.max(0, scrollableContentHeight - viewportHeight);

        let scrollLeftFromStart = 0;
        let scrollLeftFromEnd = 0;
        if (!scrollbarXHidden) {
            const rawScrollLeftFromStart =
                direction === 'rtl' ? clamp(-scrollLeft, 0, maxScrollLeft) : clamp(scrollLeft, 0, maxScrollLeft);
            scrollLeftFromStart = normalizeScrollOffset(rawScrollLeftFromStart, maxScrollLeft);
            scrollLeftFromEnd = maxScrollLeft - scrollLeftFromStart;
        }

        const rawScrollTopFromStart = !scrollbarYHidden ? clamp(scrollTop, 0, maxScrollTop) : 0;
        const scrollTopFromStart = !scrollbarYHidden ? normalizeScrollOffset(rawScrollTopFromStart, maxScrollTop) : 0;
        const scrollTopFromEnd = !scrollbarYHidden ? maxScrollTop - scrollTopFromStart : 0;
        const nextWidth = scrollbarXHidden ? 0 : viewportWidth;
        const nextHeight = scrollbarYHidden ? 0 : viewportHeight;

        let nextCornerWidth = 0;
        let nextCornerHeight = 0;
        if (!scrollbarXHidden && !scrollbarYHidden) {
            nextCornerWidth = scrollbarYEl?.offsetWidth || 0;
            nextCornerHeight = scrollbarXEl?.offsetHeight || 0;
        }

        // Only subtract corner size from scrollbar dimensions if the corner hasn't been sized yet.
        const cornerNotYetSized = cornerSize.width === 0 && cornerSize.height === 0;
        const cornerWidthOffset = cornerNotYetSized ? nextCornerWidth : 0;
        const cornerHeightOffset = cornerNotYetSized ? nextCornerHeight : 0;

        const scrollbarXOffset = getOffset(scrollbarXEl, 'padding', 'x');
        const scrollbarYOffset = getOffset(scrollbarYEl, 'padding', 'y');
        const thumbXOffset = getOffset(thumbXEl, 'margin', 'x');
        const thumbYOffset = getOffset(thumbYEl, 'margin', 'y');

        const idealNextWidth = nextWidth - scrollbarXOffset - thumbXOffset;
        const idealNextHeight = nextHeight - scrollbarYOffset - thumbYOffset;

        const maxNextWidth = scrollbarXEl
            ? Math.min(scrollbarXEl.offsetWidth - cornerWidthOffset, idealNextWidth)
            : idealNextWidth;
        const maxNextHeight = scrollbarYEl
            ? Math.min(scrollbarYEl.offsetHeight - cornerHeightOffset, idealNextHeight)
            : idealNextHeight;

        const clampedNextWidth = Math.max(MIN_THUMB_SIZE, maxNextWidth * ratioX);
        const clampedNextHeight = Math.max(MIN_THUMB_SIZE, maxNextHeight * ratioY);

        this.rootContext.setThumbSize({ width: clampedNextWidth, height: clampedNextHeight });

        // Handle Y (vertical) scroll
        if (scrollbarYEl && thumbYEl) {
            const maxThumbOffsetY = scrollbarYEl.offsetHeight - clampedNextHeight - scrollbarYOffset - thumbYOffset;
            const scrollRangeY = scrollableContentHeight - viewportHeight;
            const scrollRatioY = scrollRangeY === 0 ? 0 : scrollTop / scrollRangeY;
            // In Safari, don't allow it to go negative or too far as `scrollTop` considers the rubber band effect.
            const thumbOffsetY = Math.min(maxThumbOffsetY, Math.max(0, scrollRatioY * maxThumbOffsetY));
            thumbYEl.style.transform = `translate3d(0,${thumbOffsetY}px,0)`;
        }

        // Handle X (horizontal) scroll
        if (scrollbarXEl && thumbXEl) {
            const maxThumbOffsetX = scrollbarXEl.offsetWidth - clampedNextWidth - scrollbarXOffset - thumbXOffset;
            const scrollRangeX = scrollableContentWidth - viewportWidth;
            const scrollRatioX = scrollRangeX === 0 ? 0 : scrollLeft / scrollRangeX;
            const thumbOffsetX =
                direction === 'rtl'
                    ? clamp(scrollRatioX * maxThumbOffsetX, -maxThumbOffsetX, 0)
                    : clamp(scrollRatioX * maxThumbOffsetX, 0, maxThumbOffsetX);
            thumbXEl.style.transform = `translate3d(${thumbOffsetX}px,0,0)`;
        }

        viewportEl.style.setProperty('--scroll-area-overflow-x-start', `${scrollLeftFromStart}px`);
        viewportEl.style.setProperty('--scroll-area-overflow-x-end', `${scrollLeftFromEnd}px`);
        viewportEl.style.setProperty('--scroll-area-overflow-y-start', `${scrollTopFromStart}px`);
        viewportEl.style.setProperty('--scroll-area-overflow-y-end', `${scrollTopFromEnd}px`);

        if (cornerEl) {
            if (scrollbarXHidden || scrollbarYHidden) {
                this.rootContext.setCornerSize({ width: 0, height: 0 });
            } else {
                this.rootContext.setCornerSize({ width: nextCornerWidth, height: nextCornerHeight });
            }
        }

        this.rootContext.setHiddenState(nextHiddenState);

        this.rootContext.setOverflowEdges({
            xStart: !scrollbarXHidden && scrollLeftFromStart > threshold.xStart,
            xEnd: !scrollbarXHidden && scrollLeftFromEnd > threshold.xEnd,
            yStart: !scrollbarYHidden && scrollTopFromStart > threshold.yStart,
            yEnd: !scrollbarYHidden && scrollTopFromEnd > threshold.yEnd
        });
    }

    onScroll(): void {
        const viewportEl = this.rootContext.viewportRef.current;
        if (!viewportEl) {
            return;
        }

        this.computeThumbPosition();

        // WebKit consumes a touch that catches an in-flight momentum scroll or rubber-band bounce
        // without dispatching any DOM events for the whole gesture (not even `touchstart`), so such a
        // scroll can't be attributed to the user through events. Treat every scroll in touch modality
        // as user-driven instead, otherwise the scrollbar never shows on iOS (Base UI parity).
        if (this.rootContext.touchModality() || !this.programmaticScroll) {
            this.rootContext.handleScroll({ x: viewportEl.scrollLeft, y: viewportEl.scrollTop });
        }

        // Debounce restoring the programmatic flag so momentum scrolling (no further
        // user-interaction events) is still treated as user-driven.
        clearTimeout(this.scrollEndTimer);
        this.scrollEndTimer = setTimeout(() => {
            this.programmaticScroll = true;
        }, SCROLL_END_TIMEOUT);
    }

    onUserInteraction(): void {
        this.programmaticScroll = false;
    }

    private observeViewport(): void {
        const viewport = this.element;
        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        let hasInitialized = false;
        const resizeObserver = new ResizeObserver(() => {
            if (!hasInitialized) {
                hasInitialized = true;
                const m = this.lastMeasuredMetrics;
                if (
                    m[0] === viewport.clientHeight &&
                    m[1] === viewport.scrollHeight &&
                    m[2] === viewport.clientWidth &&
                    m[3] === viewport.scrollWidth
                ) {
                    return;
                }
            }
            this.computeThumbPosition();
        });
        resizeObserver.observe(viewport);

        // Wait for subtree animations to finish, then recompute geometry that may have
        // been affected by transform-based animations.
        this.animationsTimer = setTimeout(() => {
            const animations = viewport.getAnimations({ subtree: true });
            if (animations.length === 0) {
                return;
            }
            Promise.allSettled(animations.map((animation) => animation.finished))
                .then(() => this.computeThumbPosition())
                .catch(() => {});
        }, 0);

        this.destroyRef.onDestroy(() => resizeObserver.disconnect());
    }
}

function getHiddenState(viewport: HTMLElement): HiddenState {
    const y = viewport.clientHeight >= viewport.scrollHeight;
    const x = viewport.clientWidth >= viewport.scrollWidth;
    return { y, x, corner: y || x };
}
