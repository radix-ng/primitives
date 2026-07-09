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
    Signal,
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
import { BooleanInput, createContext, Direction, elementSize, NumberInput, watch } from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { RdxPopper } from './popper';
import { RdxPopperArrow } from './popper-arrow';
import { RdxPopperContentConfigToken } from './popper-content.config';
import {
    Align,
    getSideAndAlignFromPlacement,
    isNotNull,
    OffsetFunction,
    RdxCollisionAvoidance,
    ResolvedCollisionAvoidance,
    resolvePhysicalSide,
    Side,
    SideOrLogical,
    toLogicalSide,
    transformOrigin
} from './utils';

/**
 * `input()` transform for `sideOffset` / `alignOffset`: coerce string/number attribute values to a
 * number but pass an {@link OffsetFunction} through untouched. A **named** module-level function (not
 * an inline arrow) so compodoc parses the file — see CLAUDE.md's compodoc gotcha.
 */
function coerceOffset(value: number | OffsetFunction | string | null | undefined): number | OffsetFunction {
    return typeof value === 'function' ? value : numberAttribute(value);
}

export type RdxPopperAnchorElement =
    | Element
    | ElementRef<Element>
    | VirtualElement
    | (() => Element | VirtualElement | null)
    | null
    | undefined;

type PopperPositionParams = {
    positioningActive: boolean;
    anchor: ReferenceElement | null;
    strategy: 'fixed' | 'absolute';
    placement: Placement;
    /** The original requested side (may be logical) — used to report the side logically to offset functions. */
    side: SideOrLogical;
    isRtl: boolean;
    align: Align;
    sideOffset: number | OffsetFunction;
    alignOffset: number | OffsetFunction;
    arrowHeight: number;
    arrowWidth: number;
    collisionAvoidance: ResolvedCollisionAvoidance;
    sticky: 'partial' | 'always';
    detectOverflowOptions: {
        padding: number | Partial<Record<Side, number>>;
        boundary: Element[];
        altBoundary: boolean;
    };
    arrow: RdxPopperArrow | undefined;
    arrowPadding: number;
    hideWhenDetached: boolean;
};

const context = () => {
    const popperContentWrapper = inject(RdxPopperContentWrapper);

    return {
        placedSide: popperContentWrapper.placedSide,
        physicalPlacedSide: popperContentWrapper.physicalPlacedSide,
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
     *
     * Accepts the logical `'inline-start'` / `'inline-end'` in addition to the physical sides; those
     * resolve to `left` / `right` for the text direction (Base UI parity). The placed side reported via
     * `data-side` / `placedSide()` echoes the requested kind: logical in → logical out (even after a
     * collision flip), physical in → physical out.
     */
    readonly side = input<SideOrLogical>(this.config.side ?? 'bottom');

    /**
     * Text direction, used only to resolve a logical `side` (`inline-start` / `inline-end`) to a
     * physical one. Falls back to an enclosing direction provider, then `ltr`.
     */
    readonly dir = input<Direction | undefined>(undefined);
    private readonly direction = injectDirection(this.dir);

    /** The `side` input with any logical inline value resolved to a physical side for the direction. */
    private readonly resolvedSide = computed<Side>(() => resolvePhysicalSide(this.side(), this.direction() === 'rtl'));

    /**
     * Distance between the anchor and the popup in pixels. Also accepts an {@link OffsetFunction} that
     * reads the anchor / positioner dimensions and the resolved side / align.
     */
    readonly sideOffset = input(this.config.sideOffset ?? 0, { transform: coerceOffset });

    /**
     * How to align the popup relative to the specified side. May change when collisions occur.
     */
    readonly align = input<Align>(this.config.align ?? 'center');

    /**
     * An offset in pixels from the `start` or `end` alignment options. Also accepts an
     * {@link OffsetFunction} (same signature as `sideOffset`).
     */
    readonly alignOffset = input(this.config.alignOffset ?? 0, { transform: coerceOffset });

    /**
     * Minimum distance to maintain between the arrow and the edges of the popup.
     * If your content has border-radius, this will prevent it from overflowing the corners.
     */
    readonly arrowPadding = input<number, NumberInput>(this.config.arrowPadding ?? 0, { transform: numberAttribute });

    /**
     * When `true`, overrides the `side` and `align` preferences to prevent collisions with boundary edges.
     *
     * @deprecated Use {@link collisionAvoidance} for fine-grained control (Base UI parity). Still honored:
     * `false` disables all avoidance (unless a `collisionAvoidance` object is provided, which wins).
     */
    readonly avoidCollisions = input<boolean, BooleanInput>(this.config.avoidCollisions ?? true, {
        transform: booleanAttribute
    });

    /**
     * How the popup avoids colliding with the boundary edges, per axis (Base UI `collisionAvoidance`).
     * Overrides the deprecated `avoidCollisions` and any per-primitive preset. An object here **fully
     * replaces** the preset — omitted fields fall back to `side: 'flip'`, `align: 'flip'`,
     * `fallbackAxisSide: 'end'`, never to the preset. See {@link RdxCollisionAvoidance}.
     */
    readonly collisionAvoidance = input<RdxCollisionAvoidance | undefined>(undefined);

    /**
     * Collision avoidance resolved against the deprecated `avoidCollisions` flag, the per-primitive
     * config preset, and the wrapper defaults. Precedence: an explicit `collisionAvoidance` input →
     * a legacy `avoidCollisions=false` (disables everything) → the config preset → the Base UI defaults.
     */
    private readonly effectiveCollisionAvoidance = computed<ResolvedCollisionAvoidance>(() => {
        const explicit = this.collisionAvoidance();

        // Legacy escape hatch (deprecated): `avoidCollisions=false` disables avoidance entirely — unless
        // the consumer passes an explicit `collisionAvoidance` object, which always wins. Checked before
        // the preset so `[avoidCollisions]="false"` still works on a positioner that ships a preset.
        if (!explicit && this.avoidCollisions() === false) {
            return { side: 'none', align: 'none', fallbackAxisSide: 'none' };
        }

        // A consumer object fully REPLACES the preset (Base UI parity — the preset is only the default
        // when the consumer passes nothing); omitted fields fall back to the global defaults, not the
        // preset. `??` (not spread-merge) is what enforces the "replaces, not merges" semantics.
        const source = explicit ?? this.config.collisionAvoidance;

        return {
            side: source?.side ?? 'flip',
            align: source?.align ?? 'flip',
            fallbackAxisSide: source?.fallbackAxisSide ?? 'end'
        };
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
        () => (this.resolvedSide() + (this.align() !== 'center' ? '-' + this.align() : '')) as Placement
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

    private readonly resolvedAnchor = computed<ReferenceElement | null>(() => {
        const anchor = this.anchor();
        const resolvedAnchor = typeof anchor === 'function' ? anchor() : anchor;

        if (resolvedAnchor instanceof ElementRef) {
            return resolvedAnchor.nativeElement;
        }

        if (resolvedAnchor) {
            return resolvedAnchor;
        }

        return this.context.anchorOverride() ?? this.context.anchor()?.elementRef.nativeElement ?? null;
    });

    private readonly position = resource<ComputePositionReturn | null, PopperPositionParams>({
        params: () => this.positionParams(),
        loader: ({ params }) => {
            // Skip computing a position for a paused (closed keep-mounted) positioner.
            if (!params.positioningActive || !params.anchor) {
                return Promise.resolve(null);
            }

            const ca = params.collisionAvoidance;
            // Ported from Base UI `useAnchorPositioning`: `side`/`align`/`fallbackAxisSide` select and
            // configure the `flip()` / `shift()` middleware instead of the old boolean toggle.
            const shiftDisabled = ca.align === 'none' && ca.side !== 'shift';
            const crossAxisShiftEnabled = !shiftDisabled && (params.sticky === 'always' || ca.side === 'shift');

            const flipMiddleware =
                ca.side === 'none'
                    ? undefined
                    : flip({
                          ...params.detectOverflowOptions,
                          mainAxis: ca.side === 'flip',
                          crossAxis: ca.align === 'flip' ? 'alignment' : false,
                          fallbackAxisSideDirection: ca.fallbackAxisSide
                      });

            const shiftMiddleware = shiftDisabled
                ? undefined
                : shift({
                      ...params.detectOverflowOptions,
                      mainAxis: ca.align !== 'none',
                      crossAxis: crossAxisShiftEnabled,
                      // `partial` keeps the popup attached to the anchor (limitShift); `always` keeps it
                      // fully inside the boundary regardless (no limiter).
                      limiter: params.sticky === 'partial' ? limitShift() : undefined
                  });

            // https://floating-ui.com/docs/flip#combining-with-shift — run shift first when shifting is
            // the primary correction (or for center alignment), otherwise flip first.
            const collisionMiddleware =
                ca.side === 'shift' || ca.align === 'shift' || params.align === 'center'
                    ? [shiftMiddleware, flipMiddleware]
                    : [flipMiddleware, shiftMiddleware];

            return computePosition(params.anchor, this.elementRef.nativeElement, {
                // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
                strategy: params.strategy,
                placement: params.placement,
                middleware: [
                    offset((state) => {
                        const [placedSide, placedAlign] = getSideAndAlignFromPlacement(state.placement);
                        const data = {
                            // Report the placed side in the same kind the consumer requested: logical
                            // when a logical `side` was passed (so a post-collision flip stays logical),
                            // physical otherwise (Base UI parity).
                            side: toLogicalSide(params.side, placedSide, params.isRtl),
                            align: placedAlign,
                            anchor: {
                                width: state.rects.reference.width,
                                height: state.rects.reference.height
                            },
                            positioner: {
                                width: state.rects.floating.width,
                                height: state.rects.floating.height
                            }
                        };
                        const sideAxis =
                            typeof params.sideOffset === 'function' ? params.sideOffset(data) : params.sideOffset;
                        const alignAxis =
                            typeof params.alignOffset === 'function' ? params.alignOffset(data) : params.alignOffset;

                        return {
                            mainAxis: sideAxis + params.arrowHeight || 0,
                            // both axes so `alignOffset` also applies to center-aligned popups
                            // (`alignmentAxis` overrides `crossAxis` for start/end placements)
                            crossAxis: alignAxis,
                            alignmentAxis: alignAxis
                        };
                    }),
                    ...collisionMiddleware,
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
            });
        }
    });

    private positionParams(): PopperPositionParams {
        return {
            positioningActive: this.positioningActive(),
            anchor: this.resolvedAnchor(),
            strategy: this.positionStrategy(),
            placement: this.desiredPlacement(),
            side: this.side(),
            isRtl: this.direction() === 'rtl',
            align: this.align(),
            sideOffset: this.sideOffset(),
            alignOffset: this.alignOffset(),
            arrowHeight: this.arrowSize()().height,
            arrowWidth: this.arrowSize()().width,
            collisionAvoidance: this.effectiveCollisionAvoidance(),
            sticky: this.sticky(),
            detectOverflowOptions: this.detectOverflowOptions(),
            arrow: this.arrow(),
            arrowPadding: this.arrowPadding(),
            hideWhenDetached: this.hideWhenDetached()
        };
    }

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
        source: () => this.position.value() ?? undefined,
        computation: (value, previous) => value ?? previous?.value
    });

    /**
     * Whether the panel is positioned.
     */
    readonly isPositioned = computed(() => !!this.position.value());

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
     * The physical side the panel is currently placed against. Internal geometry (arrow position,
     * transform origins) must use this — never {@link placedSide}, which can be logical.
     */
    readonly physicalPlacedSide = computed(() => this.placement()?.side);

    /**
     * The side the panel is currently placed against, reported in the kind the consumer requested
     * (Base UI positioner `side`): when a logical `side` was passed, a placed `left`/`right` maps back
     * to `inline-start`/`inline-end` for the direction — so a post-collision flip stays logical and
     * `[data-side="inline-start"]` CSS is direction-agnostic. A physical request is always reported
     * physically.
     */
    readonly placedSide = computed<SideOrLogical | undefined>(() => {
        const side = this.placement()?.side;

        return side === undefined ? undefined : toLogicalSide(this.side(), side, this.direction() === 'rtl');
    });

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

    /**
     * Whether the positioner should actively track its anchor (recompute + `autoUpdate`). Defaults to
     * always-on — the historical behavior, correct for a positioner that unmounts when its layer closes.
     * A positioner that can stay mounted while closed (`keepMounted`) **overrides** this with its
     * open/presence signal so a closed, hidden positioner doesn't spin an endless `autoUpdate`
     * `requestAnimationFrame` loop (only relevant when `updatePositionStrategy: 'always'`). It's a
     * reassignable field (not `readonly`) because the render effect below reads it lazily, after the
     * subclass constructor has swapped it in.
     */
    protected positioningActive: Signal<boolean> = computed(() => true);

    private readonly afterRenderEffect = afterRenderEffect((onCleanup) => {
        // Closed keep-mounted positioner: skip positioning entirely so `autoUpdate` doesn't keep firing.
        if (!this.positioningActive()) {
            return;
        }

        this.position.reload();

        const anchor = this.resolvedAnchor();
        if (!anchor) {
            return;
        }

        const cleanup = autoUpdate(anchor, this.elementRef.nativeElement, () => this.position.reload(), {
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
