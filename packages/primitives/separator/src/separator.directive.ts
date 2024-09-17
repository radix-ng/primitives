import { booleanAttribute, Directive, Input } from '@angular/core';

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

@Directive({
    selector: 'div[rdxSeparatorRoot]',
    standalone: true,
    host: {
        '[attr.role]': 'decorative ? "none" : "separator"',
        // `aria-orientation` defaults to `horizontal` so we only need it if `orientation` is vertical
        '[attr.aria-orientation]': '!decorative && orientation === "vertical" ? "vertical" : null',
        '[attr.data-orientation]': 'orientation'
    }
})
export class RdxSeparatorRootDirective implements SeparatorProps {
    @Input() orientation: Orientation = DEFAULT_ORIENTATION;

    @Input({ transform: booleanAttribute }) decorative = false;
}
