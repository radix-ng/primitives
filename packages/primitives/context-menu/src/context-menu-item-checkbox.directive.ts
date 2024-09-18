import { CDK_MENU, CdkMenuItem } from '@angular/cdk/menu';
import { Directive } from '@angular/core';
import { RdxContextMenuContentDirective } from './context-menu-content.directive';
import { RdxContextMenuSelectable } from './context-menu-item-selectable';
import { RdxContextMenuItemDirective } from './context-menu-item.directive';

@Directive({
    selector: '[rdxContextMenuItemCheckbox]',
    standalone: true,
    host: {
        role: 'menuitemcheckbox'
    },
    providers: [
        { provide: RdxContextMenuSelectable, useExisting: RdxContextMenuItemCheckboxDirective },
        { provide: RdxContextMenuItemDirective, useExisting: RdxContextMenuSelectable },
        { provide: CdkMenuItem, useExisting: RdxContextMenuItemDirective },
        { provide: CDK_MENU, useExisting: RdxContextMenuContentDirective }
    ]
})
export class RdxContextMenuItemCheckboxDirective extends RdxContextMenuSelectable {
    override trigger(options?: { keepOpen: boolean }) {
        if (!this.disabled) {
            this.checked = !this.checked;

            this.checkedChange.emit(this.checked);
        }

        super.trigger(options);
    }
}
