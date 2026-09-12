import {
    computed,
    createComponent,
    Directive,
    effect,
    ElementRef,
    EnvironmentInjector,
    inject,
    input,
    inputBinding,
    numberAttribute
} from '@angular/core';
import { RdxArrow } from '@radix-ng/primitives/arrow';
import { injectPopperContentWrapperContext } from './popper-content-wrapper';
import { Side } from './utils';

const OPPOSITE_SIDE: Record<Side, Side> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
};

@Directive({
    selector: '[rdxPopperArrow]',
    host: {
        // The arrow is purely decorative — keep it out of the accessibility tree (Base UI does the same).
        'aria-hidden': 'true',
        '[style]': 'style()',
        // ADR 0002: the arrow stays visible when the popup is shifted off-center; this is the hook
        // consumers use to style it instead (e.g. hide it themselves, or adjust its shape).
        '[attr.data-uncentered]': 'uncentered() ? "" : undefined'
    }
})
export class RdxPopperArrow {
    protected readonly popperContentContext = injectPopperContentWrapperContext();

    private readonly environmentInjector = inject(EnvironmentInjector);

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly width = input(10, { transform: numberAttribute });

    readonly height = input(5, { transform: numberAttribute });

    // Geometry is physical: the arrow reads `physicalPlacedSide` (`placedSide` can be logical
    // `inline-start`/`inline-end` when a logical side was requested — a styling hook, not a direction).
    baseSide = computed(() => OPPOSITE_SIDE[this.popperContentContext.physicalPlacedSide()!]);

    /** Whether the popup was shifted off-center and the arrow could not be centered on the anchor. */
    protected readonly uncentered = computed(() => this.popperContentContext.arrowUncentered());

    protected readonly style = computed(() => {
        // `arrowX`/`arrowY` are legitimately `0` when Floating UI clamps the arrow to the padded edge
        // of the popup (e.g. `arrowPadding` defaults to `0`) — most likely exactly when the popup is
        // shifted off-center (ADR 0002 keeps that arrow visible now). A truthy check would drop `0` and
        // leave that axis unset, so check for "no value" explicitly instead.
        const arrowX = this.popperContentContext.arrowX();
        const arrowY = this.popperContentContext.arrowY();

        return {
            position: 'absolute',
            left: arrowX != null ? `${arrowX}px` : undefined,
            top: arrowY != null ? `${arrowY}px` : undefined,
            [this.baseSide()]: 0,
            transformOrigin: {
                top: '',
                right: '0 0',
                bottom: 'center 0',
                left: '100% 0'
            }[this.popperContentContext.physicalPlacedSide()!],
            transform: {
                top: 'translateY(100%)',
                right: 'translateY(50%) rotate(90deg) translateX(-50%)',
                bottom: `rotate(180deg)`,
                left: 'translateY(50%) rotate(-90deg) translateX(50%)'
            }[this.popperContentContext.physicalPlacedSide()!]
            // No `visibility` toggle here (ADR 0002): the arrow is only ever hidden by inheriting the
            // positioner's own `visibility: hidden` when the anchor is fully occluded
            // (`RdxPopperContentWrapper`'s `hideWhenDetached` / `referenceHidden` path).
        };
    });

    private onCleanup = effect((onCleanup) => {
        const component = createComponent(RdxArrow, {
            environmentInjector: this.environmentInjector,
            hostElement: this.elementRef.nativeElement,
            projectableNodes: [Array.from(this.elementRef.nativeElement.childNodes)],
            bindings: [inputBinding('width', () => this.width()), inputBinding('height', () => this.height())]
        });

        component.changeDetectorRef.detectChanges();

        onCleanup(() => component.destroy());
    });
}
