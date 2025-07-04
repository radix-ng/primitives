import { Directive } from '@angular/core';
import { injectEditableRootContext } from './editable-root';

@Directive({
    selector: 'button[rdxEditableCancelTrigger]',
    host: {
        type: 'button',
        '[attr.aria-label]': '"cancel"',
        '[attr.aria-disabled]': 'rootContext?.disabled() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext?.disabled() ? "" : undefined',
        '[disabled]': 'rootContext?.disabled()',
        '[attr.hidden]': 'rootContext?.isEditing() ? "" : undefined',

        '(click)': 'rootContext?.cancel()'
    }
})
export class RdxEditableCancelTrigger {
    protected readonly rootContext = injectEditableRootContext();
}
