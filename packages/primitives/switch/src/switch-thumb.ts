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
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.data-required]': 'rootContext.required() ? "" : undefined',
        '[attr.data-invalid]': 'rootContext.displayValid() === false ? "" : undefined',
        '[attr.data-valid]': 'rootContext.displayValid() === true ? "" : undefined',
        '[attr.data-touched]': 'rootContext.touched() ? "" : undefined',
        '[attr.data-dirty]': 'rootContext.dirty() ? "" : undefined',
        '[attr.data-filled]': 'rootContext.filled() ? "" : undefined',
        '[attr.data-focused]': 'rootContext.focused() ? "" : undefined'
    }
})
export class RdxSwitchThumb {
    protected readonly rootContext = injectSwitchContext();
}
