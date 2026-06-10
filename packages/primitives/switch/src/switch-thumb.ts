import { Directive } from '@angular/core';
import { injectSwitchContext } from './switch-context';

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
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined'
    }
})
export class RdxSwitchThumb {
    protected readonly rootContext = injectSwitchContext();
}
