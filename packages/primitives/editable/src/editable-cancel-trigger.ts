import { Directive, input } from '@angular/core';
import { injectEditableRootContext } from './editable-root';

@Directive({
    selector: 'button[rdxEditableCancelTrigger]',
    host: {
        type: 'button',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.hidden]': 'rootContext.isEditing() ? "" : undefined',

        '(click)': 'rootContext.cancel()'
    }
})
export class RdxEditableCancelTrigger {
    protected readonly rootContext = injectEditableRootContext();

    /** Accessible label for the trigger. Override to localize. */
    readonly ariaLabel = input<string>('cancel', { alias: 'aria-label' });
}
