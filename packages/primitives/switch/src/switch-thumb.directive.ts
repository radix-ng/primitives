import { Directive } from '@angular/core';

import { injectSwitch } from './rdxSwitchToken';

@Directive({
    selector: '[rdxSwitchThumb]',
    standalone: true,
    host: {
        '[attr.data-state]': 'switch.checked ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'switch.disabled ? "true" : null'
    }
})
export class RdxSwitchThumbDirective {
    /**
     * Access the switch directive.
     */
    protected readonly switch = injectSwitch();
}
