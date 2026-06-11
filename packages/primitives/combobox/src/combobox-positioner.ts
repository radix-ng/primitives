import { booleanAttribute, Directive, ElementRef, input, numberAttribute } from '@angular/core';
import { Align, RdxPopperContentWrapper, Side } from '@radix-ng/primitives/popper';

/**
 * Positions the popup relative to the input anchor using the popper engine. Re-exposes the popper
 * positioning inputs.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxPositioner]',
    exportAs: 'rdxComboboxPositioner',
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
            '--radix-combobox-content-transform-origin': 'var(--radix-popper-transform-origin)',
            '--radix-combobox-content-available-width': 'var(--radix-popper-available-width)',
            '--radix-combobox-content-available-height': 'var(--radix-popper-available-height)',
            '--radix-combobox-trigger-width': 'var(--radix-popper-anchor-width)',
            '--radix-combobox-trigger-height': 'var(--radix-popper-anchor-height)'
        }`
    }
})
export class RdxComboboxPositioner {
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
