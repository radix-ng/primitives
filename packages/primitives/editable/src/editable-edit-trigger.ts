import { Directive, input } from '@angular/core';
import { injectEditableRootContext } from './editable-root';

@Directive({
    selector: 'button[rdxEditableEditTrigger]',
    host: {
        type: 'button',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.hidden]': 'rootContext.isEditing() ? "" : undefined',

        '(click)': 'rootContext.edit()'
    }
})
export class RdxEditableEditTrigger {
    protected readonly rootContext = injectEditableRootContext();

    /** Accessible label for the trigger. Override to localize. */
    readonly ariaLabel = input<string>('edit', { alias: 'aria-label' });
}
