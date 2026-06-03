import { computed, Directive, input, linkedSignal } from '@angular/core';

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
        '[attr.aria-orientation]': 'computedAriaOrientation()',

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

    protected readonly orientationState = linkedSignal({
        source: this.orientation,
        computation: (value) => value
    });

    /**
     * Computes the `aria-orientation` attribute. It is set to "vertical" only when
     * the separator orientation is vertical. Horizontal is the implicit ARIA default.
     *
     * @ignore
     */
    protected readonly computedAriaOrientation = computed(() =>
        this.orientationState() === 'vertical' ? 'vertical' : undefined
    );

    updateOrientation(value: Orientation) {
        this.orientationState.set(value);
    }
}
