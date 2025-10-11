import {
    afterNextRender,
    booleanAttribute,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    numberAttribute,
    signal
} from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { Align, RdxPopperContentWrapper, Side } from '@radix-ng/primitives/popper';
import { RdxDismissableLayer } from '../../dismissable-layer';
import { injectRdxTooltipContext } from './tooltip';
import { useGraceArea } from './useGraceArea';

@Directive({
    selector: '[rdxTooltipContentWrapper]',
    hostDirectives: [
        RdxDismissableLayer,
        {
            directive: RdxPopperContentWrapper,
            inputs: [
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
                'updatePositionStrategy'
            ]
        }
    ],
    host: {
        '[attr.data-state]': 'rootContext.state()',
        // re-namespace exposed content custom properties
        '[style]': `{
          '--radix-tooltip-content-transform-origin': 'var(--radix-popper-transform-origin)',
          '--radix-tooltip-content-available-width': 'var(--radix-popper-available-width)',
          '--radix-tooltip-content-available-height': 'var(--radix-popper-available-height)',
          '--radix-tooltip-trigger-width': 'var(--radix-popper-anchor-width)',
          '--radix-tooltip-trigger-height': 'var(--radix-popper-anchor-height)',
        }`
    }
})
export class RdxTooltipContentWrapper {
    protected readonly rootContext = injectRdxTooltipContext()!;
    private readonly destroyRef = inject(DestroyRef);
    private readonly dismissableLayer = inject(RdxDismissableLayer);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * The preferred side of the anchor to render against when open.
     * Will be reversed when collisions occur and avoidCollisions is enabled.
     */
    readonly side = input<Side>('bottom');

    /**
     * The distance in pixels from the anchor.
     */
    readonly sideOffset = input(0, { transform: numberAttribute });

    /**
     * The preferred alignment against the anchor. May change when collisions occur.
     */
    readonly align = input<Align>('center');

    /**
     * An offset in pixels from the `start` or `end` alignment options.
     */
    readonly alignOffset = input(0, { transform: numberAttribute });

    /**
     * The padding between the arrow and the edges of the content.
     * If your content has border-radius, this will prevent it from overflowing the corners.
     */
    readonly arrowPadding = input(0, { transform: numberAttribute });

    /**
     * When `true`, overrides the `side` and `align` preferences to prevent collisions with boundary edges.
     */
    readonly avoidCollisions = input(true, { transform: booleanAttribute });

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

    /**
     * Whether to hide the content when the trigger becomes fully occluded.
     */
    readonly hideWhenDetached = input(false, { transform: booleanAttribute });

    /**
     * Whether to update the position of the floating element on every animation frame if required.
     */
    readonly updatePositionStrategy = input<'optimized' | 'always'>('always');

    /**
     * Emits when the element is placed.
     */
    readonly placed = outputFromObservable(outputToObservable(inject(RdxPopperContentWrapper).placed));

    /**
     * Event handler called when the escape key is down.
     * Can be prevented.
     */
    readonly escapeKeyDown = outputFromObservable(outputToObservable(this.dismissableLayer.escapeKeyDown));

    /**
     * Event handler called when a `pointerdown` event happens outside of the `DismissableLayer`.
     * Can be prevented.
     */
    readonly pointerDownOutside = outputFromObservable(outputToObservable(this.dismissableLayer.pointerDownOutside));

    private readonly triggerEl = signal<HTMLElement | null>(null);
    private readonly containerEl = signal<HTMLElement | null>(null);

    private readonly graceArea = useGraceArea(this.triggerEl, this.containerEl, 300);

    private readonly afterNextRender = afterNextRender(() => {
        this.triggerEl.set(this.rootContext.trigger().elementRef.nativeElement);
        this.containerEl.set(this.elementRef.nativeElement);

        const handleScroll = (event: Event) => {
            const target = event.target as HTMLElement;

            if (target?.contains(this.rootContext.trigger().elementRef.nativeElement)) {
                this.rootContext.close();
            }
        };

        window.addEventListener('scroll', handleScroll, { capture: true });

        this.destroyRef.onDestroy(() => {
            window.removeEventListener('scroll', handleScroll, { capture: true });
        });

        this.graceArea.onPointerExit(() => {
            if (this.rootContext.disableHoverableContent()) return;
            this.rootContext.close();
        });
    });

    constructor() {
        this.dismissableLayer.focusOutside.subscribe((e) => e.preventDefault());

        this.dismissableLayer.dismiss.subscribe(() => this.rootContext.close());

        this.dismissableLayer.pointerDownOutside.subscribe((event) => {
            if (
                this.rootContext.disableClosingTrigger() &&
                this.rootContext.trigger().elementRef.nativeElement.contains(event.target as HTMLElement)
            )
                event.preventDefault();
        });
    }
}
