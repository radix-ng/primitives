import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    computed,
    contentChild,
    Directive,
    ElementRef,
    forwardRef,
    inject,
    Injector,
    input,
    linkedSignal,
    numberAttribute,
    output,
    Provider,
    resource,
    signal,
    Type
} from '@angular/core';
import type { ComputePositionReturn, ReferenceElement, VirtualElement } from '@floating-ui/dom';
import {
    autoUpdate,
    computePosition,
    flip,
    arrow as floatingUIArrow,
    hide,
    limitShift,
    offset,
    Placement,
    shift,
    size
} from '@floating-ui/dom';
import { BooleanInput, createContext, elementSize, NumberInput, watch } from '@radix-ng/primitives/core';
import { RdxPopper } from './popper';
import { RdxPopperArrow } from './popper-arrow';
import { RdxPopperContentConfigToken } from './popper-content.config';
import { Align, isNotNull, Side, transformOrigin } from './utils';

export type RdxPopperAnchorElement =
    | Element
    | ElementRef<Element>
    | VirtualElement
    | (() => Element | VirtualElement | null)
    | null
    | undefined;

const context = () => {
    const popperContentWrapper = inject(RdxPopperContentWrapper);

    return {
        placedSide: popperContentWrapper.placedSide,
        placedAlign: popperContentWrapper.placedAlign,
        arrowX: popperContentWrapper.arrowX,
        arrowY: popperContentWrapper.arrowY,
        shouldHideArrow: popperContentWrapper.shouldHideArrow,
        isPositioned: popperContentWrapper.isPositioned,
        anchorHidden: popperContentWrapper.anchorHidden
    };
};

export type PopperContentWrapperContext = ReturnType<typeof context>;

export const [injectPopperContentWrapperContext, providePopperContentWrapperContext] =
    createContext<PopperContentWrapperContext>('PopperContentWrapperContext', 'utils/popper');

@Directive({
    selector: '[rdxPopperContentWrapper]',
    providers: [providePopperContentWrapperContext(context)],
    host: {
        'data-radix-popper-content-wrapper': '',
        // Placement state, emitted once for every positioner (ADR 0012). The popup
        // (`RdxPopperContent`) keeps its own `data-side`/`data-align` as popup-level styling hooks.
        '[attr.data-side]': 'placedSide()',
        '[attr.data-align]': 'placedAlign()',
        '[attr.data-anchor-hidden]': 'anchorHidden() ? "" : undefined',
        '[style]': 'style()'
    }
})
export class RdxPopperContentWrapper {
    private readonly elementRef = inject(ElementRef);
    private readonly injector = inject(Injector);

    private readonly context = inject(RdxPopper);

    /** Optional positioning defaults provided by a composing primitive (e.g. tooltip). */
    private readonly config = inject(RdxPopperContentConfigToken);

    /**
     * An element to position the popup against. Defaults to the popper anchor.
     */
    readonly anchor = input<RdxPopperAnchorElement>();

    /**
     * The preferred side of the anchor to render against when open.
     * Will be reversed when collisions occur and avoidCollisions is enabled.
     */
    readonly side = input<Side>(this.config.side ?? 'bottom');

    /**
     * Distance between the anchor and the popup in pixels.
     */
    readonly sideOffset = input<number, NumberInput>(this.config.sideOffset ?? 0, { transform: numberAttribute });

    /**
     * How to align the popup relative to the specified side. May change when collisions occur.
     */
    readonly align = input<Align>(this.config.align ?? 'center');

    /** An offset in pixels from the `start` or `end` alignment options. */
    readonly alignOffset = input<number, NumberInput>(this.config.alignOffset ?? 0, { transform: numberAttribute });

    /**
     * Minimum distance to maintain between the arrow and the edges of the popup.
     * If your content has border-radius, this will prevent it from overflowing the corners.
     */
    readonly arrowPadding = input<number, NumberInput>(this.config.arrowPadding ?? 0, { transform: numberAttribute });

    /** When `true`, overrides the `side` and `align` preferences to prevent collisions with boundary edges. */
    readonly avoidCollisions = input<boolean, BooleanInput>(this.config.avoidCollisions ?? true, {
        transform: booleanAttribute
    });

    /**
     * The element used as the collision boundary.
     * By default this is the viewport, though you can provide additional element(s) to be included in this check.
     */
    readonly collisionBoundary = input<ElementRef<HTMLElement> | ElementRef<HTMLElement>[]>();
    /**
     * The distance in pixels from the boundary edges where collision detection should occur.
     * Accepts a number (same for all sides), or a partial padding object, for example: `{ top: 20, left: 20 }`.
     */
    readonly collisionPadding = input<number | Partial<Record<Side, number>>>(this.config.collisionPadding ?? 0);

    /**
     * The sticky behavior on the align axis. `partial` will keep the
     * content in the boundary as long as the trigger is at least partially
     * in the boundary whilst "always" will keep the content in the boundary
     * regardless.
     */
    readonly sticky = input<'partial' | 'always'>(this.config.sticky ?? 'partial');

    /**
     * Whether to hide the content when the trigger becomes fully occluded.
     */
    readonly hideWhenDetached = input<boolean, BooleanInput>(this.config.hideWhenDetached ?? false, {
        transform: booleanAttribute
    });

    /**
     *  The type of CSS position property to use.
     */
    readonly positionStrategy = input<'fixed' | 'absolute'>(this.config.positionStrategy ?? 'fixed');

    /**
     * Strategy to update the position of the floating element on every animation frame.
     */
    readonly updatePositionStrategy = input<'optimized' | 'always'>(this.config.updatePositionStrategy ?? 'optimized');

    /**
     * Emits when the element is placed.
     */
    readonly placed = output<void>();

    readonly arrow = contentChild(forwardRef(() => RdxPopperArrow));

    /**
     * When `true`, the content is rendered click/hover-through (`pointer-events: none`). Used for
     * cursor-following content (e.g. a tooltip tracking the pointer) that must never intercept the
     * pointer and steal hover from its trigger.
     */
    readonly nonInteractive = signal(false);

    readonly shouldHideArrow = computed(() => this.position.value()?.middlewareData['arrow']?.centerOffset !== 0);
    /** Whether the arrow could not be centered on the anchor because the popup was shifted. */
    readonly arrowUncentered = computed(
        () => (this.position.value()?.middlewareData['arrow']?.centerOffset ?? 0) !== 0
    );
    readonly arrowX = computed(() => this.position.value()?.middlewareData['arrow']?.x);
    readonly arrowY = computed(() => this.position.value()?.middlewareData['arrow']?.y);
    readonly anchorHidden = computed(() => this.position.value()?.middlewareData.hide?.referenceHidden === true);

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
        boundary: this.boundary().filter(isNotNull),
        // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
        altBoundary: this.hasExplicitBoundaries()
    }));

    private readonly resolvedAnchor = computed<ReferenceElement>(() => {
        const anchor = this.anchor();
        const resolvedAnchor = typeof anchor === 'function' ? anchor() : anchor;

        if (resolvedAnchor instanceof ElementRef) {
            return resolvedAnchor.nativeElement;
        }

        if (resolvedAnchor) {
            return resolvedAnchor;
        }

        const fallbackAnchor = this.context.anchorOverride() ?? this.context.anchor()?.elementRef.nativeElement;

        if (!fallbackAnchor) {
            throw new Error('RdxPopperContentWrapper requires an anchor.');
        }

        return fallbackAnchor;
    });

    private readonly position = resource({
        params: () => ({
            anchor: this.resolvedAnchor(),
            strategy: this.positionStrategy(),
            placement: this.desiredPlacement(),
            sideOffset: this.sideOffset(),
            alignOffset: this.alignOffset(),
            arrowHeight: this.arrowSize()().height,
            arrowWidth: this.arrowSize()().width,
            avoidCollisions: this.avoidCollisions(),
            sticky: this.sticky(),
            detectOverflowOptions: this.detectOverflowOptions(),
            arrow: this.arrow(),
            arrowPadding: this.arrowPadding(),
            hideWhenDetached: this.hideWhenDetached()
        }),
        loader: ({ params }) =>
            computePosition(params.anchor, this.elementRef.nativeElement, {
                // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
                strategy: params.strategy,
                placement: params.placement,
                middleware: [
                    offset({
                        mainAxis: params.sideOffset + params.arrowHeight || 0,
                        alignmentAxis: params.alignOffset
                    }),
                    params.avoidCollisions &&
                        shift({
                            mainAxis: true,
                            crossAxis: false,
                            limiter: params.sticky === 'partial' ? limitShift() : undefined,
                            ...params.detectOverflowOptions
                        }),
                    params.avoidCollisions && flip({ ...params.detectOverflowOptions }),
                    size({
                        ...params.detectOverflowOptions,
                        apply: ({ elements, rects, availableWidth, availableHeight }) => {
                            const { width: anchorWidth, height: anchorHeight } = rects.reference;
                            const contentStyle = elements.floating.style;
                            contentStyle.setProperty('--radix-popper-available-width', `${availableWidth}px`);
                            contentStyle.setProperty('--radix-popper-available-height', `${availableHeight}px`);
                            contentStyle.setProperty('--radix-popper-anchor-width', `${anchorWidth}px`);
                            contentStyle.setProperty('--radix-popper-anchor-height', `${anchorHeight}px`);
                        }
                    }),
                    params.arrow &&
                        floatingUIArrow({
                            element: params.arrow.elementRef.nativeElement,
                            padding: params.arrowPadding
                        }),
                    transformOrigin({
                        arrowWidth: params.arrowWidth,
                        arrowHeight: params.arrowHeight
                    }),
                    params.hideWhenDetached &&
                        hide({
                            strategy: 'referenceHidden',
                            ...params.detectOverflowOptions
                        })
                ]
            })
    });

    /**
     * The last successfully computed position, retained while a new one is being computed.
     *
     * The `position` resource resets `value()` to `undefined` whenever its params change (e.g. on
     * every pointer move while a tooltip tracks the cursor). Reading it directly would blank the
     * popup (`visibility: hidden` + off-screen transform) for the frames between a move and the next
     * resolved position — a visible flicker at high pointer-move rates. Holding the previous value
     * keeps the popup placed and visible until the new position is ready.
     */
    private readonly resolvedPosition = linkedSignal<
        ComputePositionReturn | undefined,
        ComputePositionReturn | undefined
    >({
        source: () => this.position.value(),
        computation: (value, previous) => value ?? previous?.value
    });

    /**
     * Whether the panel is positioned.
     */
    readonly isPositioned = computed(() => this.position.hasValue());

    /**
     * The current placement of the panel.
     */
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

    /**
     * The side the panel is currently placed against.
     */
    readonly placedSide = computed(() => this.placement()?.side);

    /**
     * The current alignment of the panel.
     */
    readonly placedAlign = computed(() => this.placement()?.align);

    protected readonly style = computed(() => {
        const pos = this.resolvedPosition();
        const x = pos?.x;
        const y = pos?.y;

        const ready = Number.isFinite(x) && Number.isFinite(y);

        return {
            position: this.positionStrategy(),
            transform: ready ? '' : 'translate(0, -200%)', // keep off the page when measuring
            minWidth: 'max-content',
            // ADR 0012 §3: z-index belongs on the positioner (set it via a class/style on the
            // positioner element), Base UI-aligned. The wrapper no longer copies the popup's computed
            // z-index, so a positioner no longer requires an inner `RdxPopperContent` to exist.
            top: Number.isFinite(y) ? `${y}px` : '',
            left: Number.isFinite(x) ? `${x}px` : '',
            '--radix-popper-transform-origin': [
                pos?.middlewareData['transformOrigin']?.x,
                pos?.middlewareData['transformOrigin']?.y
            ].join(' '),
            '--radix-popper-content-wrapper-width': `${this.elementRef.nativeElement.offsetWidth}px`,
            '--radix-popper-content-wrapper-height': `${this.elementRef.nativeElement.offsetHeight}px`,

            // Unified Base UI-style variables (ADR 0012), emitted once for every positioner so
            // consumers learn a single dialect. They alias the engine-level `--radix-popper-*` values
            // (the `--anchor-*`/`--available-*` ones are set imperatively by the `size` middleware).
            '--anchor-width': 'var(--radix-popper-anchor-width)',
            '--anchor-height': 'var(--radix-popper-anchor-height)',
            '--available-width': 'var(--radix-popper-available-width)',
            '--available-height': 'var(--radix-popper-available-height)',
            '--positioner-width': 'var(--radix-popper-content-wrapper-width)',
            '--positioner-height': 'var(--radix-popper-content-wrapper-height)',
            '--transform-origin': 'var(--radix-popper-transform-origin)',

            visibility: ready ? 'visible' : 'hidden',
            pointerEvents: this.nonInteractive() || !ready ? 'none' : 'auto',

            // hide the content if using the hide middleware and should be hidden
            // set visibility to hidden and disable pointer events so the UI behaves
            // as if the PopperContent isn't there at all
            ...(pos?.middlewareData.hide?.referenceHidden && {
                visibility: 'hidden',
                pointerEvents: 'none'
            })
        };
    });

    private readonly afterRenderEffect = afterRenderEffect((onCleanup) => {
        this.position.reload();

        const cleanup = autoUpdate(this.resolvedAnchor(), this.elementRef.nativeElement, () => this.position.reload(), {
            animationFrame: this.updatePositionStrategy() === 'always'
        });

        onCleanup(cleanup);
    });

    constructor() {
        watch([this.isPositioned], ([isPositioned]) => {
            if (!isPositioned) {
                return;
            }

            afterNextRender(
                () => {
                    this.placed.emit();
                },
                { injector: this.injector }
            );
        });
    }
}

/**
 * Providers a "thin" positioner that `extends RdxPopperContentWrapper` must include. Angular
 * inherits a base directive's inputs/outputs/host bindings/queries but **not** its `providers`, so
 * the `useExisting` alias (lets the popup and arrow resolve the subclass through the
 * {@link RdxPopperContentWrapper} token) and the wrapper context provider (what
 * `injectPopperContentWrapperContext()` reads) are re-declared here in one place.
 *
 * Combine with {@link provideRdxPopperContentConfig} for per-primitive positioning defaults:
 *
 * ```ts
 * providers: [
 *   ...provideRdxPopperContentWrapper(RdxComboboxPositioner),
 *   provideRdxPopperContentConfig({ sideOffset: 4, align: 'start' })
 * ]
 * ```
 */
export function provideRdxPopperContentWrapper(positioner: Type<RdxPopperContentWrapper>): Provider[] {
    return [{ provide: RdxPopperContentWrapper, useExisting: positioner }, providePopperContentWrapperContext(context)];
}

/**
 * Deprecated per-primitive aliases of the unified popper variables (ADR 0012). Since the wrapper now
 * emits the unified `--anchor-*` / `--available-*` / `--transform-origin` set itself, a positioner no
 * longer hand-writes a re-namespacing `[style]` map; it spreads this helper into a host `[style]`
 * binding only to keep the legacy `--radix-<name>-content-*` / `--radix-<name>-trigger-*` names alive
 * for one release of consumer back-compat. Migrate to the unified set; these are removed next minor.
 *
 * @deprecated Use the unified `--anchor-*` / `--available-*` / `--transform-origin` variables.
 */
export function legacyPopperVars(name: string): Record<string, string> {
    return {
        [`--radix-${name}-content-transform-origin`]: 'var(--radix-popper-transform-origin)',
        [`--radix-${name}-content-available-width`]: 'var(--radix-popper-available-width)',
        [`--radix-${name}-content-available-height`]: 'var(--radix-popper-available-height)',
        [`--radix-${name}-trigger-width`]: 'var(--radix-popper-anchor-width)',
        [`--radix-${name}-trigger-height`]: 'var(--radix-popper-anchor-height)'
    };
}
