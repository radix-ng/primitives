import { Directive } from '@angular/core';
import { RdxMenuTriggerDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[MenuBarTrigger]',
    hostDirectives: [
        {
            directive: RdxMenuTriggerDirective,
            inputs: [
                'disabled',
                'menuTriggerFor'
            ]
        }
    ]
})
export class RdxMenuBarTriggerDirective {}
