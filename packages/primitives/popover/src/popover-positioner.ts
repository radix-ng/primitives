import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, ElementRef, inject, input, numberAttribute } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { Align, RdxPopperContentWrapper, Side } from '@radix-ng/primitives/popper';

/**
 * Positions the popover against its trigger.
 */
@Directive({
    selector: '[rdxPopoverPositioner]',
    hostDirectives: [
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
                'positionStrategy',
                'updatePositionStrategy'
            ]
        }
    ],
    host: {
        '[style]': `{
            '--radix-popover-content-transform-origin': 'var(--radix-popper-transform-origin)',
            '--radix-popover-content-available-width': 'var(--radix-popper-available-width)',
            '--radix-popover-content-available-height': 'var(--radix-popper-available-height)',
            '--radix-popover-trigger-width': 'var(--radix-popper-anchor-width)',
            '--radix-popover-trigger-height': 'var(--radix-popper-anchor-height)'
        }`
    }
})
export class RdxPopoverPositioner {
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
    readonly arrowPadding = input<number, NumberInput>(0, { transform: numberAttribute });

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
    readonly collisionPadding = input<number | Partial<Record<Side, number>>>(0);

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
    readonly updatePositionStrategy = input<'optimized' | 'always'>('optimized');

    /**
     * Emits when the popup has been placed.
     */
    readonly placed = outputFromObservable(outputToObservable(inject(RdxPopperContentWrapper).placed));
}
