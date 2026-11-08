import { Directive, input } from '@angular/core';

/** Visual and semantic separator between groups of OTP slots. */
@Directive({
    selector: 'div[rdxOtpFieldSeparator]',
    exportAs: 'rdxOtpFieldSeparator',
    host: {
        role: 'separator',
        '[attr.aria-orientation]': 'orientation()',
        '[attr.data-orientation]': 'orientation()'
    }
})
export class RdxOtpFieldSeparator {
    /** Orientation of this separator. */
    readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}
