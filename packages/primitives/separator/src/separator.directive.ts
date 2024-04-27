import { booleanAttribute, Directive, Input } from '@angular/core';

export type SeparatorOrientation = 'horizontal' | 'vertical';

@Directive({
    selector: '[rdxSeparator]',
    standalone: true,
    host: {
        '[attr.role]': 'decorative ? "none" : "separator"',
        '[attr.aria-orientation]': '!decorative && orientation === "vertical" ? "vertical" : null',
        '[attr.data-orientation]': 'orientation'
    }
})
export class RdxSeparatorDirective {
    /**
     * The orientation of the separator.
     * @default 'horizontal'
     */
    @Input('rdxSeparatorOrientation') orientation: SeparatorOrientation = 'horizontal';

    /**
     * If true, the separator will not be included in the accessibility tree.
     * @default false
     */
    @Input({ alias: 'rdxSeparatorDecorative', transform: booleanAttribute }) decorative = false;
}
