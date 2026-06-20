import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    signal,
    Signal
} from '@angular/core';
import { BooleanInput, createContext, Direction, injectId } from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { SCROLL_TIMEOUT } from './constants';
import { getOffset } from './utils';

export type Size = { width: number; height: number };
export type Coords = { x: number; y: number };
export type OverflowEdges = { xStart: boolean; xEnd: boolean; yStart: boolean; yEnd: boolean };
export type HiddenState = { x: boolean; y: boolean; corner: boolean };

/** A minimal, React-`ref`-like mutable holder shared through context. */
export type MutableRef<T> = { current: T | null };

export type OverflowEdgeThreshold = number | Partial<{ xStart: number; xEnd: number; yStart: number; yEnd: number }>;

const DEFAULT_SIZE: Size = { width: 0, height: 0 };
const DEFAULT_OVERFLOW_EDGES: OverflowEdges = { xStart: false, xEnd: false, yStart: false, yEnd: false };
const DEFAULT_HIDDEN_STATE: HiddenState = { x: true, y: true, corner: true };

export interface ScrollAreaRootContext {
    readonly rootId: string;
    readonly direction: Signal<Direction>;
    readonly overflowEdgeThreshold: Signal<{ xStart: number; xEnd: number; yStart: number; yEnd: number }>;
    readonly disableStyleElements: Signal<boolean>;

    // Reactive state
    readonly hovering: Signal<boolean>;
    readonly scrollingX: Signal<boolean>;
    readonly scrollingY: Signal<boolean>;
    readonly touchModality: Signal<boolean>;
    readonly hasMeasuredScrollbar: Signal<boolean>;
    readonly cornerSize: Signal<Size>;
    readonly thumbSize: Signal<Size>;
    readonly hiddenState: Signal<HiddenState>;
    readonly overflowEdges: Signal<OverflowEdges>;

    // Element references (filled in by the child parts as they mount)
    readonly rootRef: MutableRef<HTMLElement>;
    readonly viewportRef: MutableRef<HTMLElement>;
    readonly scrollbarYRef: MutableRef<HTMLElement>;
    readonly scrollbarXRef: MutableRef<HTMLElement>;
    readonly thumbYRef: MutableRef<HTMLElement>;
    readonly thumbXRef: MutableRef<HTMLElement>;
    readonly cornerRef: MutableRef<HTMLElement>;

    // State setters used by the viewport's measurement pass
    setHovering(value: boolean): void;
    setHasMeasuredScrollbar(value: boolean): void;
    setScrollingX(value: boolean): void;
    setScrollingY(value: boolean): void;
    setThumbSize(value: Size): void;
    setCornerSize(value: Size): void;
    setHiddenState(value: HiddenState): void;
    setOverflowEdges(value: OverflowEdges): void;

    // Pointer/scroll handlers shared with the scrollbar and thumb
    handleScroll(position: Coords): void;
    handlePointerDown(event: PointerEvent): void;
    handlePointerMove(event: PointerEvent): void;
    handlePointerUp(event: PointerEvent): void;
}

export const [injectScrollAreaRootContext, provideScrollAreaRootContext] = createContext<ScrollAreaRootContext>(
    'ScrollAreaRootContext',
    'components/scroll-area'
);

const rootContext = (): ScrollAreaRootContext => {
    const root = inject(RdxScrollAreaRoot);
    return {
        rootId: root.rootId,
        direction: root.direction,
        overflowEdgeThreshold: root.normalizedThreshold,
        disableStyleElements: root.disableStyleElements,
        hovering: root.hovering,
        scrollingX: root.scrollingX,
        scrollingY: root.scrollingY,
        touchModality: root.touchModality,
        hasMeasuredScrollbar: root.hasMeasuredScrollbar,
        cornerSize: root.cornerSize,
        thumbSize: root.thumbSize,
        hiddenState: root.hiddenState,
        overflowEdges: root.overflowEdges,
        rootRef: root.rootRef,
        viewportRef: root.viewportRef,
        scrollbarYRef: root.scrollbarYRef,
        scrollbarXRef: root.scrollbarXRef,
        thumbYRef: root.thumbYRef,
        thumbXRef: root.thumbXRef,
        cornerRef: root.cornerRef,
        setHovering: (v) => root.hovering.set(v),
        setHasMeasuredScrollbar: (v) => root.hasMeasuredScrollbar.set(v),
        setScrollingX: (v) => root.setScrollingX(v),
        setScrollingY: (v) => root.setScrollingY(v),
        setThumbSize: (v) => root.setThumbSize(v),
        setCornerSize: (v) => root.setCornerSize(v),
        setHiddenState: (v) => root.setHiddenState(v),
        setOverflowEdges: (v) => root.setOverflowEdges(v),
        handleScroll: (p) => root.handleScroll(p),
        handlePointerDown: (e) => root.handlePointerDown(e),
        handlePointerMove: (e) => root.handlePointerMove(e),
        handlePointerUp: (e) => root.handlePointerUp(e)
    };
};

/**
 * Groups all parts of the scroll area.
 * Renders a `<div>` element.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxScrollAreaRoot]',
    exportAs: 'rdxScrollAreaRoot',
    providers: [provideScrollAreaRootContext(rootContext)],
    host: {
        role: 'presentation',
        '[style.position]': '"relative"',
        '[style.--scroll-area-corner-height]': 'cornerSize().height + "px"',
        '[style.--scroll-area-corner-width]': 'cornerSize().width + "px"',
        '[attr.data-scrolling]': '(scrollingX() || scrollingY()) ? "" : undefined',
        '[attr.data-has-overflow-x]': '!hiddenState().x ? "" : undefined',
        '[attr.data-has-overflow-y]': '!hiddenState().y ? "" : undefined',
        '[attr.data-overflow-x-start]': 'overflowEdges().xStart ? "" : undefined',
        '[attr.data-overflow-x-end]': 'overflowEdges().xEnd ? "" : undefined',
        '[attr.data-overflow-y-start]': 'overflowEdges().yStart ? "" : undefined',
        '[attr.data-overflow-y-end]': 'overflowEdges().yEnd ? "" : undefined',
        '(pointerenter)': 'onPointerEnterOrMove($event)',
        '(pointermove)': 'onPointerEnterOrMove($event)',
        '(pointerdown)': 'onTouchModalityChange($event)',
        '(pointerleave)': 'hovering.set(false)'
    }
})
export class RdxScrollAreaRoot {
    private readonly destroyRef = inject(DestroyRef);

    readonly rootId = injectId('rdx-scroll-area-');

    /** Text direction of the scroll area. Affects horizontal (RTL) scroll math. */
    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });
    readonly direction: Signal<Direction> = injectDirection(this.dirInput);

    /**
     * The threshold in pixels that must be passed before the overflow edge attributes are applied.
     * Accepts a single number for all edges or an object to configure them individually.
     */
    readonly overflowEdgeThreshold = input<OverflowEdgeThreshold>(0);
    readonly disableStyleElements = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly normalizedThreshold = computed(() => normalizeOverflowEdgeThreshold(this.overflowEdgeThreshold()));

    readonly hovering = signal(false);
    readonly scrollingX = signal(false);
    readonly scrollingY = signal(false);
    readonly touchModality = signal(false);
    readonly hasMeasuredScrollbar = signal(false);
    readonly cornerSize = signal<Size>(DEFAULT_SIZE);
    readonly thumbSize = signal<Size>(DEFAULT_SIZE);
    readonly hiddenState = signal<HiddenState>(DEFAULT_HIDDEN_STATE);
    readonly overflowEdges = signal<OverflowEdges>(DEFAULT_OVERFLOW_EDGES);

    readonly rootRef: MutableRef<HTMLElement> = { current: inject(ElementRef).nativeElement };
    readonly viewportRef: MutableRef<HTMLElement> = { current: null };
    readonly scrollbarYRef: MutableRef<HTMLElement> = { current: null };
    readonly scrollbarXRef: MutableRef<HTMLElement> = { current: null };
    readonly thumbYRef: MutableRef<HTMLElement> = { current: null };
    readonly thumbXRef: MutableRef<HTMLElement> = { current: null };
    readonly cornerRef: MutableRef<HTMLElement> = { current: null };

    // Imperative drag state (deliberately non-reactive).
    private thumbDragging = false;
    private startY = 0;
    private startX = 0;
    private startScrollTop = 0;
    private startScrollLeft = 0;
    private currentOrientation: 'vertical' | 'horizontal' = 'vertical';
    private scrollPosition: Coords = { x: 0, y: 0 };

    private scrollYTimer: ReturnType<typeof setTimeout> | undefined;
    private scrollXTimer: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        this.destroyRef.onDestroy(() => {
            clearTimeout(this.scrollYTimer);
            clearTimeout(this.scrollXTimer);
        });
    }

    setScrollingX(value: boolean): void {
        this.scrollingX.set(value);
    }

    setScrollingY(value: boolean): void {
        this.scrollingY.set(value);
    }

    setThumbSize(value: Size): void {
        const prev = this.thumbSize();
        if (prev.width !== value.width || prev.height !== value.height) {
            this.thumbSize.set(value);
        }
    }

    setCornerSize(value: Size): void {
        const prev = this.cornerSize();
        if (prev.width !== value.width || prev.height !== value.height) {
            this.cornerSize.set(value);
        }
    }

    setHiddenState(value: HiddenState): void {
        const prev = this.hiddenState();
        if (prev.x !== value.x || prev.y !== value.y || prev.corner !== value.corner) {
            this.hiddenState.set(value);
        }
    }

    setOverflowEdges(value: OverflowEdges): void {
        const prev = this.overflowEdges();
        if (
            prev.xStart !== value.xStart ||
            prev.xEnd !== value.xEnd ||
            prev.yStart !== value.yStart ||
            prev.yEnd !== value.yEnd
        ) {
            this.overflowEdges.set(value);
        }
    }

    handleScroll(scrollPosition: Coords): void {
        const offsetX = scrollPosition.x - this.scrollPosition.x;
        const offsetY = scrollPosition.y - this.scrollPosition.y;
        this.scrollPosition = scrollPosition;

        if (offsetY !== 0) {
            this.scrollingY.set(true);
            clearTimeout(this.scrollYTimer);
            this.scrollYTimer = setTimeout(() => this.scrollingY.set(false), SCROLL_TIMEOUT);
        }

        if (offsetX !== 0) {
            this.scrollingX.set(true);
            clearTimeout(this.scrollXTimer);
            this.scrollXTimer = setTimeout(() => this.scrollingX.set(false), SCROLL_TIMEOUT);
        }
    }

    handlePointerDown(event: PointerEvent): void {
        if (event.button !== 0) {
            return;
        }

        this.thumbDragging = true;
        this.startY = event.clientY;
        this.startX = event.clientX;
        this.currentOrientation =
            ((event.currentTarget as Element | null)?.getAttribute('data-orientation') as 'vertical' | 'horizontal') ??
            'vertical';

        const viewport = this.viewportRef.current;
        if (viewport) {
            this.startScrollTop = viewport.scrollTop;
            this.startScrollLeft = viewport.scrollLeft;
        }
        if (this.thumbYRef.current && this.currentOrientation === 'vertical') {
            this.thumbYRef.current.setPointerCapture(event.pointerId);
        }
        if (this.thumbXRef.current && this.currentOrientation === 'horizontal') {
            this.thumbXRef.current.setPointerCapture(event.pointerId);
        }
    }

    handlePointerMove(event: PointerEvent): void {
        if (!this.thumbDragging) {
            return;
        }

        const deltaY = event.clientY - this.startY;
        const deltaX = event.clientX - this.startX;

        const viewport = this.viewportRef.current;
        if (!viewport) {
            return;
        }

        const scrollableContentHeight = viewport.scrollHeight;
        const viewportHeight = viewport.clientHeight;
        const scrollableContentWidth = viewport.scrollWidth;
        const viewportWidth = viewport.clientWidth;

        if (this.thumbYRef.current && this.scrollbarYRef.current && this.currentOrientation === 'vertical') {
            const scrollbarYOffset = getOffset(this.scrollbarYRef.current, 'padding', 'y');
            const thumbYOffset = getOffset(this.thumbYRef.current, 'margin', 'y');
            const thumbHeight = this.thumbYRef.current.offsetHeight;
            const maxThumbOffsetY =
                this.scrollbarYRef.current.offsetHeight - thumbHeight - scrollbarYOffset - thumbYOffset;
            const scrollRatioY = deltaY / maxThumbOffsetY;

            viewport.scrollTop = this.startScrollTop + scrollRatioY * (scrollableContentHeight - viewportHeight);
            event.preventDefault();

            this.scrollingY.set(true);
            clearTimeout(this.scrollYTimer);
            this.scrollYTimer = setTimeout(() => this.scrollingY.set(false), SCROLL_TIMEOUT);
        }

        if (this.thumbXRef.current && this.scrollbarXRef.current && this.currentOrientation === 'horizontal') {
            const scrollbarXOffset = getOffset(this.scrollbarXRef.current, 'padding', 'x');
            const thumbXOffset = getOffset(this.thumbXRef.current, 'margin', 'x');
            const thumbWidth = this.thumbXRef.current.offsetWidth;
            const maxThumbOffsetX =
                this.scrollbarXRef.current.offsetWidth - thumbWidth - scrollbarXOffset - thumbXOffset;
            const scrollRatioX = deltaX / maxThumbOffsetX;

            viewport.scrollLeft = this.startScrollLeft + scrollRatioX * (scrollableContentWidth - viewportWidth);
            event.preventDefault();

            this.scrollingX.set(true);
            clearTimeout(this.scrollXTimer);
            this.scrollXTimer = setTimeout(() => this.scrollingX.set(false), SCROLL_TIMEOUT);
        }
    }

    handlePointerUp(event: PointerEvent): void {
        this.thumbDragging = false;

        // `pointercancel` releases capture implicitly, so guard against releasing a
        // capture we no longer hold (which would throw).
        if (
            this.thumbYRef.current &&
            this.currentOrientation === 'vertical' &&
            this.thumbYRef.current.hasPointerCapture(event.pointerId)
        ) {
            this.thumbYRef.current.releasePointerCapture(event.pointerId);
        }
        if (
            this.thumbXRef.current &&
            this.currentOrientation === 'horizontal' &&
            this.thumbXRef.current.hasPointerCapture(event.pointerId)
        ) {
            this.thumbXRef.current.releasePointerCapture(event.pointerId);
        }
    }

    onTouchModalityChange(event: PointerEvent): void {
        this.touchModality.set(event.pointerType === 'touch');
    }

    onPointerEnterOrMove(event: PointerEvent): void {
        this.onTouchModalityChange(event);

        if (event.pointerType !== 'touch') {
            const root = this.rootRef.current;
            const target = event.target as Node | null;
            this.hovering.set(!!root && !!target && root.contains(target));
        }
    }
}

function normalizeOverflowEdgeThreshold(threshold: OverflowEdgeThreshold | undefined): {
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
} {
    if (typeof threshold === 'number') {
        const value = Math.max(0, threshold);
        return { xStart: value, xEnd: value, yStart: value, yEnd: value };
    }

    return {
        xStart: Math.max(0, threshold?.xStart || 0),
        xEnd: Math.max(0, threshold?.xEnd || 0),
        yStart: Math.max(0, threshold?.yStart || 0),
        yEnd: Math.max(0, threshold?.yEnd || 0)
    };
}
