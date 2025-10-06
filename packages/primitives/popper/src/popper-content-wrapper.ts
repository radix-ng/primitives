import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    computed,
    contentChild,
    DestroyRef,
    Directive,
    ElementRef,
    forwardRef,
    inject,
    Injector,
    input,
    numberAttribute,
    output,
    PLATFORM_ID,
    resource
} from '@angular/core';
import {
    arrow,
    autoUpdate,
    computePosition,
    flip,
    hide,
    limitShift,
    offset,
    Placement,
    shift,
    size
} from '@floating-ui/dom';
import { createContext, elementSize } from '@radix-ng/primitives/core';
import { RdxPopper } from './popper';
import { RdxPopperArrow } from './popper-arrow';
import { RdxPopperContent } from './popper-content';
import { Align, Side, transformOrigin } from './utils';

const context = () => {
    const popperContentContext = inject(RdxPopperContentWrapper);

    return {
        placedSide: popperContentContext.placedSide,
        placedAlign: popperContentContext.placedAlign,
        arrowX: popperContentContext.arrowX,
        arrowY: popperContentContext.arrowY,
        shouldHideArrow: popperContentContext.shouldHideArrow,
        isPositioned: popperContentContext.isPositioned
    };
};

export type PopperContentContext = ReturnType<typeof context>;

export const [injectPopperContentContext, providePopperContentContext] =
    createContext<PopperContentContext>('PopperContentWrapperContext');

@Directive({
    selector: '[rdxPopperContentWrapper]',
    providers: [providePopperContentContext(context)],
    host: {
        '[style]': 'style()'
    }
})
export class RdxPopperContentWrapper {
    private readonly elementRef = inject(ElementRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);

    private readonly context = inject(RdxPopper);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    /**
     * The preferred side of the anchor to render against when open.
     * Will be reversed when collisions occur and avoidCollisions is enabled.
     */
    readonly side = input<Side>('bottom');

    /** The distance in pixels from the anchor. */
    readonly sideOffset = input<number, NumberInput>(0, { transform: numberAttribute });

    /** The preferred alignment against the anchor. May change when collisions occur. */
    readonly align = input<Align>('center');

    /** An offset in pixels from the `start` or `end` alignment options. */
    readonly alignOffset = input<number, NumberInput>(0, { transform: numberAttribute });

    /**
     * The padding between the arrow and the edges of the content.
     * If your content has border-radius, this will prevent it from overflowing the corners.
     */
    readonly arrowPadding = input<number, NumberInput>(0, { transform: numberAttribute });

    /** When `true`, overrides the `side` and `align` preferences to prevent collisions with boundary edges. */
    readonly avoidCollisions = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /**
     * The element used as the collision boundary.
     * By default this is the viewport, though you can provide additional element(s) to be included in this check.
     */
    readonly collisionBoundary = input<ElementRef<HTMLElement> | ElementRef<HTMLElement>[]>();
    /**
     * The distance in pixels from the boundary edges where collision detection should occur.
     * Accepts a number (same for all sides), or a partial padding object, for example: `{ top: 20, left: 20 }`.
     */
    readonly collisionPadding = input<number | Partial<Record<Side, number>>>(0);

    /**
     * The sticky behavior on the `align` axis.
     * - `partial` will keep the content in the boundary as long as the trigger is at least partially in the boundary
     * - `always` will keep the content in the boundary regardless.
     */
    readonly sticky = input<'partial' | 'always'>('partial');

    /** Whether to hide the content when the trigger becomes fully occluded. */
    readonly hideWhenDetached = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether to update the position of the floating element on every animation frame if required. */
    readonly updatePositionStrategy = input<'optimized' | 'always'>('optimized');

    /** Emits when the element is placed. */
    readonly placed = output<void>();

    readonly arrow = contentChild(forwardRef(() => RdxPopperArrow));

    readonly shouldHideArrow = computed(() => this.position.value()?.middlewareData['arrow']?.centerOffset !== 0);

    readonly arrowX = computed(() => this.position.value()?.middlewareData['arrow']?.x);
    readonly arrowY = computed(() => this.position.value()?.middlewareData['arrow']?.y);

    private readonly desiredPlacement = computed(
        () => (this.side() + (this.align() !== 'center' ? '-' + this.align() : '')) as Placement
    );

    private readonly arrowSize = computed(() => {
        const arrowElementRef = this.arrow()?.elementRef;

        if (!arrowElementRef) {
            return computed(() => ({
                height: 0,
                width: 0
            }));
        }

        return elementSize({
            elementRef: arrowElementRef,
            injector: this.injector
        });
    });

    private readonly boundary = computed(() => {
        const boundary = this.collisionBoundary();

        if (Array.isArray(boundary)) {
            return boundary.map((e) => e.nativeElement);
        }

        if (!boundary) {
            return [];
        }

        return [boundary.nativeElement];
    });

    private readonly hasExplicitBoundaries = computed(() => this.boundary().length > 0);

    private readonly detectOverflowOptions = computed(() => ({
        padding: this.collisionPadding(),
        boundary: this.boundary(),
        // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
        altBoundary: this.hasExplicitBoundaries()
    }));

    private readonly position = resource({
        loader: () =>
            computePosition(this.context.anchor().elementRef.nativeElement, this.elementRef.nativeElement, {
                // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
                strategy: 'fixed',
                placement: this.desiredPlacement(),
                middleware: [
                    offset({
                        mainAxis: this.sideOffset() + this.arrowSize()().height || 0,
                        alignmentAxis: this.alignOffset()
                    }),
                    this.avoidCollisions() &&
                        shift({
                            mainAxis: true,
                            crossAxis: false,
                            limiter: this.sticky() === 'partial' ? limitShift() : undefined,
                            ...this.detectOverflowOptions()
                        }),
                    this.avoidCollisions() && flip({ ...this.detectOverflowOptions() }),
                    size({
                        ...this.detectOverflowOptions(),
                        apply: ({ elements, rects, availableWidth, availableHeight }) => {
                            const { width: anchorWidth, height: anchorHeight } = rects.reference;
                            const contentStyle = elements.floating.style;
                            contentStyle.setProperty('--radix-popper-available-width', `${availableWidth}px`);
                            contentStyle.setProperty('--radix-popper-available-height', `${availableHeight}px`);
                            contentStyle.setProperty('--radix-popper-anchor-width', `${anchorWidth}px`);
                            contentStyle.setProperty('--radix-popper-anchor-height', `${anchorHeight}px`);
                        }
                    }),
                    this.arrow() &&
                        arrow({
                            element: this.arrow()!.elementRef.nativeElement,
                            padding: this.arrowPadding()
                        }),
                    transformOrigin({
                        arrowWidth: this.arrowSize()().width,
                        arrowHeight: this.arrowSize()().height
                    }),
                    this.hideWhenDetached() &&
                        hide({
                            strategy: 'referenceHidden',
                            ...this.detectOverflowOptions()
                        })
                ]
            })
    });

    /** Whether the panel is positioned. */
    readonly isPositioned = computed(() => this.position.hasValue());

    /** The current placement of the panel. */
    readonly placement = computed(() => {
        const placement = this.position.value()?.placement;

        if (!placement) {
            return;
        }

        const [side, align = 'center'] = placement.split('-');

        return {
            side: side as Side,
            align: align as Align
        };
    });

    /** The side the panel is currently placed against. */
    readonly placedSide = computed(() => this.placement()?.side);

    /** The current alignment of the panel. */
    readonly placedAlign = computed(() => this.placement()?.align);

    private readonly contentElementRef = contentChild.required<RdxPopperContent, ElementRef<HTMLElement>>(
        RdxPopperContent,
        {
            read: ElementRef
        }
    );

    protected readonly contentZIndex = computed(() => {
        if (!this.isBrowser) {
            return 0;
        }

        return getComputedStyle(this.contentElementRef().nativeElement).zIndex;
    });

    protected readonly style = computed(() => {
        const pos = this.position.value();
        const x = pos?.x;
        const y = pos?.y;

        return {
            position: 'absolute',
            minWidth: 'max-content',
            zIndex: this.contentZIndex(),
            top: Number.isFinite(y as number) ? `${y}px` : '',
            left: Number.isFinite(x as number) ? `${x}px` : '',
            '--radix-popper-transform-origin': [
                pos?.middlewareData['transformOrigin']?.x,
                pos?.middlewareData['transformOrigin']?.y
            ].join(' '),
            transform: this.isPositioned() ? '' : 'translate(0, -200%)',
            visibility: pos?.middlewareData.hide?.referenceHidden ? 'hidden' : '',
            pointerEvents: pos?.middlewareData.hide?.referenceHidden ? 'none' : ''
        };
    });

    private readonly afterNextRender = afterNextRender(() => {
        this.position.reload();

        const cleanup = autoUpdate(
            this.context.anchor().elementRef.nativeElement,
            this.elementRef.nativeElement,
            () => this.position.reload(),
            {
                animationFrame: this.updatePositionStrategy() === 'always'
            }
        );

        this.destroyRef.onDestroy(cleanup);
    });
}
