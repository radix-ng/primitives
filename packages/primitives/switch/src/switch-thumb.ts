import { injectSwitchContext } from './switch-context';
import { Directive } from '@angular/core';

/**
 * The moving part of the switch that indicates whether it is on or off.
 *
 * @see https://base-ui.com/react/components/switch
 */
@Directive({
    selector: 'span[rdxSwitchThumb]',
    exportAs: 'rdxSwitchThumb',
    host: {
        '[attr.data-checked]': 'rootContext.checked() ? "" : undefined',
        '[attr.data-unchecked]': 'rootContext.checked() ? undefined : ""',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.data-required]': 'rootContext.required() ? "" : undefined'
    }
})
export class RdxSwitchThumb {
    protected readonly rootContext = injectSwitchContext();
}
