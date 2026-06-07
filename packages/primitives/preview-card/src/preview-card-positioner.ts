import { booleanAttribute, Directive, effect, ElementRef, inject, input, numberAttribute, signal } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { BooleanInput, NumberInput, useGraceArea } from '@radix-ng/primitives/core';
import {
    Align,
    provideRdxPopperContentConfig,
    RdxPopperAnchorElement,
    RdxPopperContentWrapper,
    Side
} from '@radix-ng/primitives/popper';
import { injectRdxPreviewCardRootContext } from './preview-card-root';

/**
 * Positions the preview-card against its trigger.
 */
@Directive({
    selector: '[rdxPreviewCardPositioner]',
    providers: [
        provideRdxPopperContentConfig({ arrowPadding: 5, collisionPadding: 5, updatePositionStrategy: 'always' })
    ],
    hostDirectives: [
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
        '[attr.data-anchor-hidden]': 'wrapper.anchorHidden() ? "" : undefined',
        '[attr.data-align]': 'wrapper.placedAlign()',
        '[attr.data-side]': 'wrapper.placedSide()',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[style]': `{
            '--anchor-width': 'var(--radix-popper-anchor-width)',
            '--anchor-height': 'var(--radix-popper-anchor-height)',
            '--available-width': 'var(--radix-popper-available-width)',
            '--available-height': 'var(--radix-popper-available-height)',
            '--positioner-width': 'var(--radix-popper-content-wrapper-width)',
            '--positioner-height': 'var(--radix-popper-content-wrapper-height)',
            '--transform-origin': 'var(--radix-popper-transform-origin)',
            '--radix-preview-card-content-transform-origin': 'var(--radix-popper-transform-origin)',
            '--radix-preview-card-content-available-width': 'var(--radix-popper-available-width)',
            '--radix-preview-card-content-available-height': 'var(--radix-popper-available-height)',
            '--radix-preview-card-trigger-width': 'var(--radix-popper-anchor-width)',
            '--radix-preview-card-trigger-height': 'var(--radix-popper-anchor-height)'
        }`
    }
})
export class RdxPreviewCardPositioner {
    protected readonly rootContext = injectRdxPreviewCardRootContext()!;
    protected readonly wrapper = inject(RdxPopperContentWrapper);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly triggerEl = signal<HTMLElement | null>(null);
    private readonly containerEl = signal<HTMLElement | null>(this.elementRef.nativeElement);
    private readonly graceArea = useGraceArea(this.triggerEl, this.containerEl);

    /**
     * An element to position the popup against. Defaults to the trigger.
     */
    readonly anchor = input<RdxPopperAnchorElement>();

    /**
     * The preferred side of the trigger to render against when open.
     */
    readonly side = input<Side>('bottom');

    /**
     * Distance between the trigger and the popup in pixels.
     */
    readonly sideOffset = input<number, NumberInput>(0, { transform: numberAttribute });

    /**
     * How to align the popup relative to the specified side.
     */
    readonly align = input<Align>('center');

    /**
     * An offset in pixels from the `start` or `end` alignment options.
     */
    readonly alignOffset = input<number, NumberInput>(0, { transform: numberAttribute });

    /**
     * Minimum distance to maintain between the arrow and the edges of the popup.
     */
    readonly arrowPadding = input<number, NumberInput>(5, { transform: numberAttribute });

    /**
     * Whether to override side and alignment preferences to prevent collisions.
     */
    readonly avoidCollisions = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /**
     * The element used as the collision boundary.
     */
    readonly collisionBoundary = input<ElementRef<HTMLElement> | ElementRef<HTMLElement>[]>();

    /**
     * Distance in pixels from the boundary edges where collision detection should occur.
     */
    readonly collisionPadding = input<number | Partial<Record<Side, number>>>(5);

    /**
     * The sticky behavior on the alignment axis.
     */
    readonly sticky = input<'partial' | 'always'>('partial');

    /**
     * Whether to hide the popup when the trigger becomes fully occluded.
     */
    readonly hideWhenDetached = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The CSS position strategy used by Floating UI.
     */
    readonly positionStrategy = input<'fixed' | 'absolute'>('fixed');

    /**
     * Whether to update position on every animation frame.
     */
    readonly updatePositionStrategy = input<'optimized' | 'always'>('always');

    /**
     * Emits when the popup has been placed.
     */
    readonly placed = outputFromObservable(outputToObservable(inject(RdxPopperContentWrapper).placed));

    constructor() {
        effect(() => this.triggerEl.set(this.rootContext.trigger() ?? null));

        this.graceArea.onPointerExit(() => {
            this.rootContext.closeOnHover();
        });
    }
}
