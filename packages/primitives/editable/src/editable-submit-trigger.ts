import { Directive, input } from '@angular/core';
import { injectEditableRootContext } from './editable-root';

@Directive({
    selector: 'button[rdxEditableSubmitTrigger]',
    host: {
        type: 'button',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.disabled]': 'rootContext.disabled() ? "" : undefined',
        '(click)': 'rootContext.submit()'
    }
})
export class RdxEditableSubmitTrigger {
    protected readonly rootContext = injectEditableRootContext();

    /** Accessible label for the trigger. Override to localize. */
    readonly ariaLabel = input<string>('submit', { alias: 'aria-label' });
}
