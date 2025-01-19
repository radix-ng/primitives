import { Directive } from '@angular/core';
import { RdxMenuGroupDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[MenubarGroup]',
    hostDirectives: [RdxMenuGroupDirective]
})
export class RdxMenubarGroupDirective {}
