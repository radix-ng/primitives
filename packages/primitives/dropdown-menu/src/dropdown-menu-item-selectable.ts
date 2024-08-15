import { booleanAttribute, Directive, EventEmitter, Input, Output } from '@angular/core';
import { RdxDropdownMenuItemDirective } from './dropdown-menu-item.directive';

/** Base class providing checked state for selectable DropdownMenuItems. */
@Directive({
    standalone: true,
    host: {
        '[attr.aria-checked]': '!!checked',
        '[attr.aria-disabled]': 'disabled || null',
        '[attr.data-state]': 'checked ? "checked" : "unchecked"'
    }
})
export class RdxDropdownMenuSelectable extends RdxDropdownMenuItemDirective {
    /** Whether the element is checked */
    @Input({ transform: booleanAttribute }) checked: boolean = false;

    @Output() readonly checkedChange = new EventEmitter<boolean>();
}
