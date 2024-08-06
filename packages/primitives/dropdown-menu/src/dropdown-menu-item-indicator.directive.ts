import { Directive, inject } from '@angular/core';
import { RdxDropdownMenuSelectable } from './dropdown-menu-item-selectable';

@Directive({
    selector: '[rdxDropdownMenuItemIndicator]',
    standalone: true,
    host: {
        '[style.display]': "item.checked ? 'block' : 'none'",
        '[attr.data-state]': "item.checked ? 'checked' : 'unchecked'"
    }
})
export class RdxDropdownMenuItemIndicatorDirective {
    item = inject(RdxDropdownMenuSelectable);
}
