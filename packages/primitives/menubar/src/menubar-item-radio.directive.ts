import { Directive } from '@angular/core';
import { RdxMenuItemRadioDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[RdxMenuBarItemRadio]',
    hostDirectives: [
        {
            directive: RdxMenuItemRadioDirective,
            inputs: ['disabled', 'checked']
        }
    ]
})
export class RdxMenubarItemRadioDirective {}
