import { Directive } from '@angular/core';

import { injectSwitch } from './switch-root.directive';

@Directive({
    selector: 'input[SwitchInput]',
    exportAs: 'SwitchInput',
    standalone: true,
    host: {
        type: 'checkbox',
        tabindex: '-1',
        '[attr.aria-checked]': 'switchRoot.checked()',
        '[attr.aria-hidden]': 'true',
        '[attr.aria-required]': 'switchRoot.required',
        '[attr.data-state]': 'switchRoot.checked() ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'switchRoot.disabled ? "true" : null',
        '[attr.disabled]': 'switchRoot.disabled ? switchRoot.disabled : null',
        style: 'position: absolute; pointerEvents: none; opacity: 0; margin: 0;'
    }
})
export class RdxSwitchInputDirective {
    protected readonly switchRoot = injectSwitch();
}
