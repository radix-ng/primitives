import { booleanAttribute, Directive, EventEmitter, Input, Output } from '@angular/core';
import { RdxContextMenuItemDirective } from './context-menu-item.directive';

/** Base class providing checked state for selectable ContextMenuItems. */
@Directive({
    standalone: true,
    host: {
        '[attr.aria-checked]': '!!checked',
        '[attr.aria-disabled]': 'disabled || null',
        '[attr.data-state]': 'checked ? "checked" : "unchecked"'
    }
})
export class RdxContextMenuSelectable extends RdxContextMenuItemDirective {
    /** Whether the element is checked */
    @Input({ transform: booleanAttribute }) checked = false;

    @Output() readonly checkedChange = new EventEmitter<boolean>();
}
