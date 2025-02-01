import { Directive } from '@angular/core';
import { RdxMenuItemIndicatorDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[RdxMenuBarItemIndicator]',
    hostDirectives: [RdxMenuItemIndicatorDirective]
})
export class RdxMenubarItemIndicatorDirective {}
