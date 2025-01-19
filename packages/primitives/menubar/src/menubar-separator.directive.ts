import { Directive } from '@angular/core';
import { RdxMenuSeparatorDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[MenubarSeparator]',
    hostDirectives: [RdxMenuSeparatorDirective]
})
export class RdxMenubarSeparatorDirective {}
