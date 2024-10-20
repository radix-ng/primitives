import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input } from '@angular/core';

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
 */
@Directive({
    selector: 'div[rdxSeparatorRoot]',
    standalone: true,
    host: {
        '[attr.role]': 'computedRole()',
        '[attr.aria-orientation]': 'computedAriaOrientation()',

        '[attr.data-orientation]': 'orientation()'
    }
})
export class RdxSeparatorRootDirective {
    /**
     * Orientation of the separator, can be either 'horizontal' or 'vertical'.
     * Defaults to 'horizontal'.
     */
    readonly orientation = input<Orientation>(DEFAULT_ORIENTATION);

    /**
     * If true, the separator will be considered decorative and removed from
     * the accessibility tree. Defaults to false.
     */
    readonly decorative = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Computes the `role` attribute for the separator. If `decorative` is true,
     * the role is set to "none", otherwise it is "separator".
     */
    protected readonly computedRole = computed(() => (this.decorative() ? 'none' : 'separator'));

    /**
     * Computes the `aria-orientation` attribute. It is set to "vertical" only if
     * the separator is not decorative and the orientation is set to "vertical".
     * For horizontal orientation, the attribute is omitted.
     */
    protected readonly computedAriaOrientation = computed(() =>
        !this.decorative() && this.orientation() === 'vertical' ? 'vertical' : null
    );
}
