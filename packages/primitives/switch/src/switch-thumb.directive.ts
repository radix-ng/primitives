import { Directive } from '@angular/core';
import { injectSwitchRootContext } from './switch-root.directive';

/**
 * @group Components
 */
@Directive({
    selector: 'span[rdxSwitchThumb]',
    exportAs: 'rdxSwitchThumb',
    host: {
        '[attr.data-disabled]': 'rootContext?.disabled() ? "true" : undefined',
        '[attr.data-state]': 'rootContext?.checked() ? "checked" : "unchecked"'
    }
})
export class RdxSwitchThumbDirective {
    protected readonly rootContext = injectSwitchRootContext();
}
