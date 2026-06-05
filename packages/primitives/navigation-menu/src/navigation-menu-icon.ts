import { computed, Directive, inject } from '@angular/core';
import { RdxNavigationMenuItem } from './navigation-menu-item';

/**
 * A visual indicator (e.g. a caret) rendered inside a trigger. Exposes the open state so the icon
 * can rotate when its item opens.
 */
@Directive({
    selector: '[rdxNavigationMenuIcon]',
    host: {
        'aria-hidden': 'true',
        '[attr.data-state]': 'open() ? "open" : "closed"'
    }
})
export class RdxNavigationMenuIcon {
    private readonly item = inject(RdxNavigationMenuItem);

    protected readonly open = computed(() => this.item.isOpen());
}
