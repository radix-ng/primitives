import { Directive } from '@angular/core';
import { injectSwitch } from './switch-root.directive';

@Directive({
    selector: 'span[rdxSwitchThumb]',
    exportAs: 'rdxSwitchThumb',
    standalone: true,
    host: {
        '[attr.data-disabled]': 'switchRoot.disabledState() ? "true" : null',
        '[attr.data-state]': 'switchRoot.checkedState() ? "checked" : "unchecked"'
    }
})
export class RdxSwitchThumbDirective {
    protected readonly switchRoot = injectSwitch();
}
