import { Directive } from '@angular/core';
import { injectNumberFieldRootContext } from './number-field-context';

/**
 * Groups the input with the increment and decrement buttons.
 *
 * @see https://base-ui.com/react/components/number-field
 */
@Directive({
    selector: 'div[rdxNumberFieldGroup]',
    exportAs: 'rdxNumberFieldGroup',
    host: {
        role: 'group',
        '[attr.data-disabled]': 'rootContext.isDisabled() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.data-required]': 'rootContext.required() ? "" : undefined',
        '[attr.data-scrubbing]': 'rootContext.isScrubbing() ? "" : undefined'
    }
})
export class RdxNumberFieldGroup {
    protected readonly rootContext = injectNumberFieldRootContext()!;
}
