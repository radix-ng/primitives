import { Directive } from '@angular/core';
import { injectSwitch } from './switch-root.directive';

/**
 * @group Components
 */
@Directive({
    selector: 'span[rdxSwitchThumb]',
    exportAs: 'rdxSwitchThumb',
    host: {
        '[attr.data-disabled]': 'switchRoot.disabledState() ? "true" : null',
        '[attr.data-state]': 'switchRoot.checkedState() ? "checked" : "unchecked"'
    }
})
export class RdxSwitchThumbDirective {
    protected readonly switchRoot = injectSwitch();
}
