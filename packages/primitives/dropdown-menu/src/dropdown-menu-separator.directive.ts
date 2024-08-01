import { Directive } from '@angular/core';
import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';

@Directive({
    selector: '[rdxDropdownMenuSeparator]',
    standalone: true,
    hostDirectives: [RdxSeparatorRootDirective],
    host: {
        role: 'separator',
        '[attr.aria-orientation]': "'horizontal'"
    }
})
export class RdxDropdownMenuSeparatorDirective {}
