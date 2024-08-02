import { Directive } from '@angular/core';
import { RdxDropdownMenuItemDirective } from '@radix-ng/primitives/dropdown-menu';
import { RdxDropdownMenuSelectable } from './dropdown-menu-item-selectable';


@Directive({
    selector: '[rdxDropdownMenuItemCheckbox]',
    standalone: true,
    host: {
        'role': 'menuitemcheckbox'
    },
    providers: [
        { provide: RdxDropdownMenuSelectable, useExisting: RdxDropdownMenuItemCheckboxDirective },
        { provide: RdxDropdownMenuItemDirective, useExisting: RdxDropdownMenuSelectable }
    ]
})
export class RdxDropdownMenuItemCheckboxDirective extends RdxDropdownMenuSelectable {
    /**
     * Toggle the checked state of the checkbox.
     * @param options Options the configure how the item is triggered
     *   - keepOpen: specifies that the menu should be kept open after triggering the item.
     */
    override trigger(options?: { keepOpen: boolean }) {
        super.trigger(options);

        if (!this.disabled) {
            this.checked = !this.checked;
        }
    }
}

