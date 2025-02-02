import { Directive } from '@angular/core';
import { RdxMenuSeparatorDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[rdxDropdownMenuSeparator]',
    hostDirectives: [RdxMenuSeparatorDirective]
})
export class RdxDropdownMenuSeparatorDirective {}
