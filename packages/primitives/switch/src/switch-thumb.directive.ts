import { Directive } from '@angular/core';

import { injectSwitch } from './switch-root.directive';

@Directive({
    selector: 'span[SwitchThumb]',
    exportAs: 'SwitchThumb',
    standalone: true,
    host: {
        '[attr.data-disabled]': 'switchRoot.disabled ? "true" : null',
        '[attr.data-state]': 'switchRoot.checked ? "checked" : "unchecked"'
    }
})
export class RdxSwitchThumbDirective {
    protected readonly switchRoot = injectSwitch();
}
