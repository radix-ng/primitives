import { Directive, Input, booleanAttribute, Output, EventEmitter } from '@angular/core';
import { RdxDropdownMenuItemDirective } from '@radix-ng/primitives/dropdown-menu';


/** Base class providing checked state for selectable DropdownMenuItems. */
@Directive({
    host: {
        '[attr.aria-checked]': '!!checked',
        '[attr.aria-disabled]': 'disabled || null',
        '[attr.data-state]': 'checked ? "checked" : "unchecked"'
    },
    standalone: true
})
export abstract class RdxDropdownMenuSelectable extends RdxDropdownMenuItemDirective {
    /** Whether the element is checked */
    @Input({ alias: 'rdxChecked', transform: booleanAttribute })
    set checked(value: boolean) {
        if (this._checked == value) return;

        this._checked = value;

        this.rdxCheckedChange.emit(value);
    }

    get checked() {
        return this._checked;
    }

    private _checked = false

    @Output() readonly rdxCheckedChange = new EventEmitter<boolean>();

    /** Whether the item should close the menu if triggered by the spacebar. */
    protected override closeOnSpacebarTrigger = false;
}
