import { Directive, input } from '@angular/core';
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';
import { provideRootContext } from './toolbar-root.token';

@Directive({
    selector: '[rdxToolbarRoot]',
    hostDirectives: [{ directive: RdxRovingFocusGroupDirective, inputs: ['dir', 'orientation', 'loop'] }],
    providers: [provideRootContext()],
    host: {
        role: 'toolbar',
        '[attr.aria-orientation]': 'orientation()'
    }
})
export class RdxToolbarRootDirective {
    readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
    readonly dir = input<'ltr' | 'rtl'>('ltr');
}
