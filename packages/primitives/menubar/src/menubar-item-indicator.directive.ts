import { Directive } from '@angular/core';
import { RdxMenuItemIndicatorDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[MenubarItemIndicator]',
    hostDirectives: [RdxMenuItemIndicatorDirective]
})
export class RdxMenubarItemIndicatorDirective {}
