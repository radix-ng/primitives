import { CdkMenuItem } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[MenuBarItem]',
    standalone: true,
    hostDirectives: [CdkMenuItem],
    host: {
        role: 'menuitem',
        type: 'button',
        tabindex: '0',
        '[attr.aria-expanded]': 'false',
        '[attr.data-orientation]': "'horizontal'",
        '[attr.data-state]': 'false'
    }
})
export class RdxMenuItemDirective {}
