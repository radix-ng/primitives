import { Directive } from '@angular/core';
import { injectSwitchRootContext } from './switch-root.directive';

/**
 * @group Components
 */
@Directive({
    selector: 'input[rdxSwitchInput]',
    exportAs: 'rdxSwitchInput',
    host: {
        type: 'checkbox',
        role: 'switch',
        tabindex: '-1',
        // '[attr.id]': 'switchRoot.inputId()',
        // '[attr.defaultChecked]': 'switchRoot.checked()',
        // '[attr.aria-checked]': 'switchRoot.checked()',
        // '[attr.aria-hidden]': 'true',
        // '[attr.aria-label]': 'switchRoot.ariaLabel()',
        // '[attr.aria-labelledby]': 'switchRoot.ariaLabelledBy()',
        // '[attr.aria-required]': 'switchRoot.required()',
        // '[attr.data-state]': 'switchRoot.checked() ? "checked" : "unchecked"',
        // '[attr.data-disabled]': 'switchRoot.disabled() ? "true" : null',
        // '[attr.disabled]': 'switchRoot.disabled() ? switchRoot.disabled() : null',
        // '[attr.value]': 'switchRoot.checked() ? "on" : "off"',
        style: 'transform: translateX(-100%); position: absolute; overflow: hidden; pointerEvents: none; opacity: 0; margin: 0;',

        '(blur)': 'onBlur()'
    }
})
export class RdxSwitchInputDirective {
    protected readonly rootContext = injectSwitchRootContext();

    /** @ignore */
    protected onBlur() {
        // this.switchRoot.cva.onTouched?.();
    }
}
