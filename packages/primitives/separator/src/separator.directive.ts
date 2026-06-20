import { Directive, input, linkedSignal } from '@angular/core';

const DEFAULT_ORIENTATION = 'horizontal';

export type Orientation = 'horizontal' | 'vertical';

export interface SeparatorProps {
    /**
     * Either `vertical` or `horizontal`. Defaults to `horizontal`.
     */
    orientation?: Orientation;
}

/**
 * Directive that adds accessible and configurable separator element to the DOM.
 * This can be either horizontal or vertical.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxSeparatorRoot]',
    host: {
        role: 'separator',
        // Base UI emits `aria-orientation` for both orientations (matching this repo's
        // menu/combobox separators), not just the vertical override.
        '[attr.aria-orientation]': 'orientationState()',
        '[attr.data-orientation]': 'orientationState()'
    }
})
export class RdxSeparatorRootDirective {
    /**
     * Orientation of the separator, can be either 'horizontal' or 'vertical'.
     *
     * @defaultValue 'horizontal'
     * @group Props
     */
    readonly orientation = input<Orientation>(DEFAULT_ORIENTATION);

    protected readonly orientationState = linkedSignal(this.orientation);

    updateOrientation(value: Orientation) {
        this.orientationState.set(value);
    }
}
