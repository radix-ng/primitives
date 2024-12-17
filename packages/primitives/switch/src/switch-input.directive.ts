import { Directive } from '@angular/core';
import { injectSwitch } from './switch-root.directive';

@Directive({
    selector: 'input[rdxSwitchInput]',
    exportAs: 'rdxSwitchInput',
    standalone: true,
    host: {
        type: 'checkbox',
        role: 'switch',
        tabindex: '-1',
        '[attr.defaultChecked]': 'switchRoot.checkedState()',
        '[attr.aria-checked]': 'switchRoot.checkedState()',
        '[attr.aria-hidden]': 'true',
        '[attr.aria-required]': 'switchRoot.required()',
        '[attr.data-state]': 'switchRoot.checkedState() ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'switchRoot.disabledState() ? "true" : null',
        '[attr.disabled]': 'switchRoot.disabledState() ? switchRoot.disabledState() : null',
        '[attr.value]': 'switchRoot.checkedState() ? "on" : "off"',
        style: 'transform: translateX(-100%); position: absolute; overflow: hidden; pointerEvents: none; opacity: 0; margin: 0;'
    }
})
export class RdxSwitchInputDirective {
    protected readonly switchRoot = injectSwitch();
}
