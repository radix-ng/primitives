import { CdkMenuItem } from '@angular/cdk/menu';
import { Directive, inject, input, signal } from '@angular/core';

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
        '[attr.data-state]': 'false',
        '[disabled]': 'disabled'
    }
})
export class RdxMenuItemDirective {
    private readonly cdkMenuItem = inject(CdkMenuItem, { host: true });

    protected disabled = this.cdkMenuItem.disabled;
}
