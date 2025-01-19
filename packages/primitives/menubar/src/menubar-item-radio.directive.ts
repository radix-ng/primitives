import { Directive } from '@angular/core';
import { RdxMenuItemRadioDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[MenubarItemRadio]',
    hostDirectives: [{ directive: RdxMenuItemRadioDirective, inputs: ['disabled', 'checked'] }]
})
export class RdxMenubarItemRadioDirective {}
