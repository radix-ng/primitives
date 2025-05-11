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
        '[attr.defaultChecked]': 'rootContext.checked()',
        '[attr.aria-checked]': 'rootContext.checked()',
        '[attr.aria-hidden]': 'true',
        '[attr.aria-label]': 'rootContext.ariaLabel()',
        '[attr.aria-labelledby]': 'rootContext.ariaLabelledBy()',
        '[attr.aria-required]': 'rootContext.required()',
        '[attr.data-state]': 'rootContext.checked() ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'rootContext.disabled() ? "true" : null',
        '[attr.disabled]': 'rootContext.disabled() ? rootContext.disabled() : undefined',
        '[attr.value]': 'rootContext.checked() ? "on" : "off"',
        style: 'transform: translateX(-100%); position: absolute; overflow: hidden; pointerEvents: none; opacity: 0; margin: 0;',

        '(blur)': 'onBlur()'
    }
})
export class RdxSwitchInputDirective {
    protected readonly rootContext = injectSwitchRootContext()!;

    /** @ignore */
    protected onBlur() {
        this.rootContext?.markAsTouched();
    }
}
