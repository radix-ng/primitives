import { Directive } from '@angular/core';

import { RdxMenuContentDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[DropdownMenuContent]',
    standalone: true,
    hostDirectives: [RdxMenuContentDirective]
})
export class RdxDropdownMenuContentDirective {}
