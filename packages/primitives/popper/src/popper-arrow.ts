import {
    afterNextRender,
    computed,
    createComponent,
    Directive,
    effect,
    ElementRef,
    EnvironmentInjector,
    inject,
    input,
    inputBinding,
    numberAttribute,
    signal
} from '@angular/core';
import { RdxArrow } from '@radix-ng/primitives/arrow';
import { injectPopperContentWrapperContext, PopperContentWrapperContext } from './popper-content-wrapper';
import { Side } from './utils';

const OPPOSITE_SIDE: Record<Side, Side> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
};

/** @internal Geometry shared by Popper and consumers with an independently positioned popup. */
export type RdxPopperArrowGeometry = Pick<
    PopperContentWrapperContext,
    'physicalPlacedSide' | 'arrowX' | 'arrowY' | 'arrowUncentered'
>;

@Directive({
    selector: '[rdxPopperArrow]',
    host: {
        // The arrow is purely decorative — keep it out of the accessibility tree (Base UI does the same).
        'aria-hidden': 'true',
        '[style]': 'style()',
        // ADR 0002: the arrow stays visible when the popup is shifted off-center; this is the hook
        // consumers use to style it instead (e.g. hide it themselves, or adjust its shape).
        '[attr.data-uncentered]': 'positioningEnabled() && uncentered() ? "" : undefined'
    }
})
export class RdxPopperArrow {
    // Compound parts may also support a non-Popper positioning mode (Select's legacy item-aligned
    // positioner). Without geometry the arrow stays hidden and does not create its SVG.
    protected readonly popperContentContext = injectPopperContentWrapperContext(true);

    private readonly environmentInjector = inject(EnvironmentInjector);
    private readonly browserReady = signal(false);

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private projectedNodes: Node[] | undefined;

    readonly width = input(10, { transform: numberAttribute });

    readonly height = input(5, { transform: numberAttribute });

    /** @internal A composing part can suppress geometry from an unrelated ancestor positioner. */
    readonly positioningEnabled = signal(true);

    /** @internal Alternate positioners reuse the arrow renderer and supply the same geometry. */
    readonly positioningContext = signal<RdxPopperArrowGeometry | null>(this.popperContentContext);

    constructor() {
        afterNextRender(() => this.browserReady.set(true));
    }

    // Geometry is physical: the arrow reads `physicalPlacedSide` (`placedSide` can be logical
    // `inline-start`/`inline-end` when a logical side was requested — a styling hook, not a direction).
    baseSide = computed(() => {
        const side = this.positioningContext()?.physicalPlacedSide();
        return side ? OPPOSITE_SIDE[side] : undefined;
    });

    /** Whether the popup was shifted off-center and the arrow could not be centered on the anchor. */
    protected readonly uncentered = computed(() => this.positioningContext()?.arrowUncentered() ?? false);

    protected readonly style = computed(() => {
        const context = this.positioningContext();
        if (!this.positioningEnabled() || !context) {
            return { display: 'none' };
        }
        // `arrowX`/`arrowY` are legitimately `0` when Floating UI clamps the arrow to the padded edge
        // of the popup (e.g. `arrowPadding` defaults to `0`) — most likely exactly when the popup is
        // shifted off-center (ADR 0002 keeps that arrow visible now). A truthy check would drop `0` and
        // leave that axis unset, so check for "no value" explicitly instead.
        const arrowX = context.arrowX();
        const arrowY = context.arrowY();
        const baseSide = this.baseSide();
        const side = context.physicalPlacedSide();

        return {
            position: 'absolute',
            left: arrowX != null ? `${arrowX}px` : undefined,
            top: arrowY != null ? `${arrowY}px` : undefined,
            ...(baseSide ? { [baseSide]: 0 } : {}),
            transformOrigin: {
                top: '',
                right: '0 0',
                bottom: 'center 0',
                left: '100% 0'
            }[side!],
            transform: {
                top: 'translateY(100%)',
                right: 'translateY(50%) rotate(90deg) translateX(-50%)',
                bottom: `rotate(180deg)`,
                left: 'translateY(50%) rotate(-90deg) translateX(50%)'
            }[side!]
            // No `visibility` toggle here (ADR 0002): the arrow is only ever hidden by inheriting the
            // positioner's own `visibility: hidden` when the anchor is fully occluded
            // (`RdxPopperContentWrapper`'s `hideWhenDetached` / `referenceHidden` path).
        };
    });

    private onCleanup = effect((onCleanup) => {
        if (!this.browserReady() || !this.positioningEnabled() || !this.positioningContext()) {
            return;
        }
        const width = this.width();
        const height = this.height();
        // Child nodes exist after the consumer template renders, not in this directive's constructor.
        this.projectedNodes ??= Array.from(this.elementRef.nativeElement.childNodes);
        const component = createComponent(RdxArrow, {
            environmentInjector: this.environmentInjector,
            hostElement: this.elementRef.nativeElement,
            projectableNodes: [this.projectedNodes],
            bindings: [inputBinding('width', () => width), inputBinding('height', () => height)]
        });

        component.changeDetectorRef.detectChanges();

        onCleanup(() => component.destroy());
    });
}
