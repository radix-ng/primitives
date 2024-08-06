import { Directive } from '@angular/core';
import { RdxDropdownMenuItemDirective } from './dropdown-menu-item.directive';
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
export class RdxDropdownMenuItemCheckboxDirective extends RdxDropdownMenuSelectable {}

