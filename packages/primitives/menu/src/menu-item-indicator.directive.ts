import { Directive, inject } from '@angular/core';
import { RdxMenuItemCheckboxDirective } from './menu-item-checkbox.directive';
import { RdxMenuItemRadioDirective } from './menu-item-radio.directive';
import { getCheckedState, isIndeterminate } from './utils';

@Directive({
    selector: '[MenuItemIndicator]',
    host: {
        '[attr.data-state]': 'getCheckedState(isChecked)',

        '[style.display]': 'isChecked ? "" : "none"'
    }
})
export class RdxMenuItemIndicatorDirective {
    private readonly menuItemRadio = inject(RdxMenuItemRadioDirective, { host: true, optional: true });

    private readonly menuCheckboxItem = inject(RdxMenuItemCheckboxDirective, { host: true, optional: true });

    get isChecked(): boolean {
        if (this.menuItemRadio) {
            return this.menuItemRadio.checked();
        }
        if (this.menuCheckboxItem) {
            return isIndeterminate(this.menuCheckboxItem.checked()) || this.menuCheckboxItem.checked() === true;
        }
        return false;
    }

    protected readonly getCheckedState = getCheckedState;
}
