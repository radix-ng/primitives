import { Directive, Input, booleanAttribute } from '@angular/core';
import { RdxDropdownMenuItemDirective } from '@radix-ng/primitives/dropdown-menu';


/** Base class providing checked state for selectable DropdownMenuItems. */
@Directive({
    host: {
        '[attr.aria-checked]': '!!checked',
        '[attr.aria-disabled]': 'disabled || null'
    },
    standalone: true
})
export abstract class RdxDropdownMenuSelectable extends RdxDropdownMenuItemDirective {
    /** Whether the element is checked */
    @Input({ alias: 'rdxDropdownMenuItemChecked', transform: booleanAttribute }) checked: boolean = false;

    /** Whether the item should close the menu if triggered by the spacebar. */
    protected override closeOnSpacebarTrigger = false;
}
