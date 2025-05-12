import { Directive } from '@angular/core';
import { RdxMenuTriggerDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[RdxMenuBarTrigger]',
    hostDirectives: [
        {
            directive: RdxMenuTriggerDirective,
            inputs: ['disabled', 'menuTriggerFor', 'sideOffset', 'side', 'align', 'alignOffset']
        }
    ]
})
export class RdxMenuBarTriggerDirective {}
