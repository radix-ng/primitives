import { Directive } from '@angular/core';
import { injectEditableRootContext } from './editable-root';

@Directive({
    selector: 'button[rdxEditableEditTrigger]',
    host: {
        type: 'button',
        '[attr.aria-label]': '"edit"',
        '[attr.aria-disabled]': 'rootContext?.disabled() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext?.disabled() ? "" : undefined',
        '[disabled]': 'rootContext?.disabled()',
        '[attr.hidden]': 'rootContext?.isEditing() ? "" : undefined',

        '(click)': 'rootContext?.edit()'
    }
})
export class RdxEditableEditTrigger {
    protected readonly rootContext = injectEditableRootContext();
}
