import { Directive, inject } from '@angular/core';
import { RdxContextMenuSelectable } from './context-menu-item-selectable';

@Directive({
    selector: '[rdxContextMenuItemIndicator]',
    standalone: true,
    host: {
        '[style.display]': "item.checked ? 'block' : 'none'",
        '[attr.data-state]': "item.checked ? 'checked' : 'unchecked'"
    }
})
export class RdxContextMenuItemIndicatorDirective {
    item = inject(RdxContextMenuSelectable);
}
