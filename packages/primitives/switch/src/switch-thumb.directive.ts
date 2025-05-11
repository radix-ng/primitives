import { Directive } from '@angular/core';

/**
 * @group Components
 */
@Directive({
    selector: 'span[rdxSwitchThumb]',
    exportAs: 'rdxSwitchThumb',
    host: {
        // '[attr.data-disabled]': 'switchRoot.disabledState() ? "true" : null',
        // '[attr.data-state]': 'switchRoot.checkedState() ? "checked" : "unchecked"'
    }
})
export class RdxSwitchThumbDirective {
    //protected readonly switchRoot = injectSwitch();
}
