import { Directive } from '@angular/core';
import { RdxMenuItemDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[RdxMenuBarItem]',
    hostDirectives: [
        {
            directive: RdxMenuItemDirective,
            inputs: ['disabled'],
            outputs: ['onSelect']
        }
    ]
})
export class RdxMenuBarItemDirective {}
