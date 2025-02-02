import { Directive } from '@angular/core';
import { RdxMenuLabelDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[rdxDropdownMenuLabel]',
    hostDirectives: [RdxMenuLabelDirective]
})
export class RdxDropdownMenuLabelDirective {}
