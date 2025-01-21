import { Directive } from '@angular/core';
import { RdxMenuItemDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[MenuBarItem]',
    hostDirectives: [
        {
            directive: RdxMenuItemDirective,
            inputs: ['disabled']
        }
    ]
})
export class RdxMenuBarItemDirective {}
