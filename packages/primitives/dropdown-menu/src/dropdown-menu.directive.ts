import { Directive } from '@angular/core';

import { RdxMenuDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: 'div[DropdownMenu]',
    standalone: true,
    hostDirectives: [RdxMenuDirective]
})
export class RdxDropdownMenuDirective {}
