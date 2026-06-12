import { booleanAttribute, Directive, ElementRef, input, numberAttribute } from '@angular/core';
import { Align, RdxPopperContentWrapper, Side } from '@radix-ng/primitives/popper';

/**
 * Positions the popup relative to the input anchor using the popper engine. Composes the popper
 * content wrapper directly (the same building block the combobox positioner uses) and re-exposes its
 * positioning inputs.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompletePositioner]',
    exportAs: 'rdxAutocompletePositioner',
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
                'updatePositionStrategy'
            ]
        }
    ],
    host: {
        '[style]': `{
            'boxSizing': 'border-box',
            '--radix-autocomplete-content-transform-origin': 'var(--radix-popper-transform-origin)',
            '--radix-autocomplete-content-available-width': 'var(--radix-popper-available-width)',
            '--radix-autocomplete-content-available-height': 'var(--radix-popper-available-height)',
            '--radix-autocomplete-trigger-width': 'var(--radix-popper-anchor-width)',
            '--radix-autocomplete-trigger-height': 'var(--radix-popper-anchor-height)'
        }`
    }
})
export class RdxAutocompletePositioner {
    readonly side = input<Side>('bottom');
    readonly sideOffset = input(4, { transform: numberAttribute });
    readonly align = input<Align>('start');
    readonly alignOffset = input(0, { transform: numberAttribute });
    readonly arrowPadding = input(0, { transform: numberAttribute });
    readonly avoidCollisions = input(true, { transform: booleanAttribute });
    readonly collisionBoundary = input<ElementRef<HTMLElement> | ElementRef<HTMLElement>[]>();
    readonly collisionPadding = input<number | Partial<Record<Side, number>>>(0);
    readonly sticky = input<'partial' | 'always'>('partial');
    readonly hideWhenDetached = input(false, { transform: booleanAttribute });
    readonly updatePositionStrategy = input<'optimized' | 'always'>('optimized');
}
