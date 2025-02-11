import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input, linkedSignal } from '@angular/core';

const DEFAULT_ORIENTATION = 'horizontal';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ORIENTATIONS = ['horizontal', 'vertical'] as const;

export type Orientation = (typeof ORIENTATIONS)[number];

export interface SeparatorProps {
    /**
     * Either `vertical` or `horizontal`. Defaults to `horizontal`.
     */
    orientation?: Orientation;
    /**
     * Whether the component is purely decorative. When true, accessibility-related attributes
     * are updated so that the rendered element is removed from the accessibility tree.
     */
    decorative?: boolean;
}

/**
 * Directive that adds accessible and configurable separator element to the DOM.
 * This can be either horizontal or vertical and optionally decorative (which removes
 * it from the accessibility tree).
 *
 * @group Components
 */
@Directive({
    selector: 'div[rdxSeparatorRoot]',
    host: {
        '[attr.role]': 'decorativeEffect() ? "none" : "separator"',
        '[attr.aria-orientation]': 'computedAriaOrientation()',

        '[attr.data-orientation]': 'orientationEffect()'
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

    /**
     * If true, the separator will be considered decorative and removed from
     * the accessibility tree. Defaults to false.
     *
     * @defaultValue false
     * @group Props
     */
    readonly decorative = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Computes the `role` attribute for the separator. If `decorative` is true,
     * the role is set to "none", otherwise it is "separator".
     *
     * @ignore
     */
    readonly decorativeEffect = linkedSignal({
        source: this.decorative,
        computation: (value) => value
    });

    readonly orientationEffect = linkedSignal({
        source: this.orientation,
        computation: (value) => value
    });

    /**
     * Computes the `aria-orientation` attribute. It is set to "vertical" only if
     * the separator is not decorative and the orientation is set to "vertical".
     * For horizontal orientation, the attribute is omitted.
     *
     * @ignore
     */
    protected readonly computedAriaOrientation = computed(() =>
        !this.decorativeEffect() && this.orientationEffect() === 'vertical' ? 'vertical' : undefined
    );
}
