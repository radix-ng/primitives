import { Directive } from '@angular/core';

import { injectSwitch } from './switch-root.directive';

@Directive({
    selector: 'input[SwitchInput]',
    exportAs: 'SwitchInput',
    standalone: true,
    host: {
        type: 'checkbox',
        tabindex: '-1',
        '[attr.defaultChecked]': 'switchRoot.checked()',
        '[attr.aria-checked]': 'switchRoot.checked()',
        '[attr.aria-hidden]': 'true',
        '[attr.aria-required]': 'switchRoot.required()',
        '[attr.data-state]': 'switchRoot.checked() ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'switchRoot.disabledState() ? "true" : null',
        '[attr.disabled]': 'switchRoot.disabledState() ? switchRoot.disabledState() : null',
        '[attr.value]': 'switchRoot.checked() ? "on" : "off"',
        style: 'transform: translateX(-100%); position: absolute; overflow: hidden; pointerEvents: none; opacity: 0; margin: 0;'
    }
})
export class RdxSwitchInputDirective {
    protected readonly switchRoot = injectSwitch();
}
