import { Directive } from '@angular/core';
import { RdxMenuSeparatorDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[DropdownMenuSeparator]',
    standalone: true,
    hostDirectives: [RdxMenuSeparatorDirective],
    host: {
        role: 'separator',
        '[attr.aria-orientation]': "'horizontal'"
    }
})
export class RdxDropdownMenuSeparatorDirective {}
