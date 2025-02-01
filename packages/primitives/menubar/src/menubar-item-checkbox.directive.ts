import { Directive } from '@angular/core';
import { RdxMenuItemCheckboxDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[RdxMenuBarCheckboxItem]',
    hostDirectives: [
        {
            directive: RdxMenuItemCheckboxDirective,
            inputs: ['checked', 'disabled']
        }
    ]
})
export class RdxMenubarItemCheckboxDirective {}
