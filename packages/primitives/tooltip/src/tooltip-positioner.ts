import {
    afterNextRender,
    booleanAttribute,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    numberAttribute,
    signal
} from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { BooleanInput, NumberInput, useGraceArea } from '@radix-ng/primitives/core';
import { RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import {
    Align,
    provideRdxPopperContentConfig,
    RdxPopperAnchorElement,
    RdxPopperContentWrapper,
    Side
} from '@radix-ng/primitives/popper';
import { injectRdxTooltipContext } from './tooltip';

/**
 * Positions the tooltip popup against its trigger (or a custom anchor).
 */
@Directive({
    selector: '[rdxTooltipPositioner]',
    providers: [provideRdxPopperContentConfig({ side: 'top', arrowPadding: 5, collisionPadding: 5 })],
    hostDirectives: [
        RdxDismissableLayer,
        {
            directive: RdxPopperContentWrapper,
            inputs: [
                'anchor',
                'side',
                'sideOffset',
                'align',
                'alignOffset',
                'arrowPadding',
                'avoidCollisions',
                'collisionBoundary',
                'collisionPadding',
                'sticky',
                'hideWhenDetached',
                'positionStrategy',
                'updatePositionStrategy'
            ]
        }
    ],
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-side]': 'wrapper.placedSide()',
        '[attr.data-align]': 'wrapper.placedAlign()',
        '[style]': `{
            '--anchor-width': 'var(--radix-popper-anchor-width)',
            '--anchor-height': 'var(--radix-popper-anchor-height)',
            '--available-width': 'var(--radix-popper-available-width)',
            '--available-height': 'var(--radix-popper-available-height)',
            '--transform-origin': 'var(--radix-popper-transform-origin)'
        }`
    }
})
export class RdxTooltipPositioner {
    protected readonly rootContext = injectRdxTooltipContext()!;
    protected readonly wrapper = inject(RdxPopperContentWrapper);
    private readonly destroyRef = inject(DestroyRef);
    private readonly dismissableLayer = inject(RdxDismissableLayer);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * An element to position the popup against. Defaults to the trigger.
     */
    readonly anchor = input<RdxPopperAnchorElement>();

    /**
     * The preferred side of the anchor to render against when open.
     */
    readonly side = input<Side>('top');

    /**
     * The distance in pixels from the anchor.
     */
    readonly sideOffset = input<number, NumberInput>(0, { transform: numberAttribute });

    /**
     * The preferred alignment against the anchor.
     */
    readonly align = input<Align>('center');

    /**
     * An offset in pixels from the `start` or `end` alignment options.
     */
    readonly alignOffset = input<number, NumberInput>(0, { transform: numberAttribute });

    /**
     * The padding between the arrow and the edges of the content.
     */
    readonly arrowPadding = input<number, NumberInput>(5, { transform: numberAttribute });

    /**
     * When `true`, overrides the `side` and `align` preferences to prevent collisions with boundary edges.
     */
    readonly avoidCollisions = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /**
     * The element used as the collision boundary.
     */
    readonly collisionBoundary = input<ElementRef<HTMLElement> | ElementRef<HTMLElement>[]>();

    /**
     * The distance in pixels from the boundary edges where collision detection should occur.
     */
    readonly collisionPadding = input<number | Partial<Record<Side, number>>>(5);

    /**
     * The sticky behavior on the `align` axis.
     */
    readonly sticky = input<'partial' | 'always'>('partial');

    /**
     * Whether to hide the content when the trigger becomes fully occluded.
     */
    readonly hideWhenDetached = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The CSS position strategy used by Floating UI.
     */
    readonly positionStrategy = input<'fixed' | 'absolute'>('fixed');

    /**
     * Whether to update the position of the floating element on every animation frame if required.
     */
    readonly updatePositionStrategy = input<'optimized' | 'always'>('always');

    /**
     * Emits when the element is placed.
     */
    readonly placed = outputFromObservable(outputToObservable(this.wrapper.placed));

    /**
     * Event handler called when the escape key is down. Can be prevented.
     */
    readonly escapeKeyDown = outputFromObservable(outputToObservable(this.dismissableLayer.escapeKeyDown));

    /**
     * Event handler called when a `pointerdown` event happens outside of the `DismissableLayer`. Can be prevented.
     */
    readonly pointerDownOutside = outputFromObservable(outputToObservable(this.dismissableLayer.pointerDownOutside));

    private readonly triggerEl = signal<HTMLElement | null>(null);
    private readonly containerEl = signal<HTMLElement | null>(null);

    private readonly graceArea = useGraceArea(this.triggerEl, this.containerEl, 300);

    private readonly afterNextRender = afterNextRender(() => {
        this.triggerEl.set(this.rootContext.trigger() ?? null);
        this.containerEl.set(this.elementRef.nativeElement);

        const handleScroll = (event: Event) => {
            const target = event.target as HTMLElement;
            const trigger = this.rootContext.trigger();

            if (trigger && target?.contains(trigger)) {
                this.rootContext.close();
            }
        };

        window.addEventListener('scroll', handleScroll, { capture: true });

        this.destroyRef.onDestroy(() => {
            window.removeEventListener('scroll', handleScroll, { capture: true });
        });

        this.graceArea.onPointerExit(() => {
            // A disabled root is fully controlled by the consumer (e.g. the slider thumb drives
            // `open` while dragging). Hover never opens it, so the hover grace area must not close
            // it either — otherwise a drag that leaves the grace polygon would dismiss it and the
            // one-way `open` binding could not bring it back.
            if (this.rootContext.disabled() || this.rootContext.disableHoverablePopup()) return;
            this.rootContext.closeDelayed();
        });
    });

    constructor() {
        this.dismissableLayer.focusOutside.subscribe((e) => e.preventDefault());

        this.dismissableLayer.dismiss.subscribe(() => this.rootContext.close());

        // While following the cursor the popup sits right under the pointer; if it could intercept
        // the pointer it would steal hover from the trigger and the tooltip would flicker. Render it
        // pointer-events: none so the pointer always passes through to the trigger underneath.
        effect(() => this.wrapper.nonInteractive.set(this.rootContext.trackCursorAxis() !== 'none'));
    }
}
