import { Directive } from '@angular/core';
import { RdxMenuGroupDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[RdxMenuBarGroup]',
    hostDirectives: [RdxMenuGroupDirective]
})
export class RdxMenubarGroupDirective {}
