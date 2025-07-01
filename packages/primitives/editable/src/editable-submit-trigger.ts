import { Directive } from '@angular/core';
import { injectEditableRootContext } from './editable-root';

@Directive({
    selector: 'button[rdxEditableSubmitTrigger]',
    host: {
        type: 'button',
        '[attr.aria-label]': '"submit"',
        '[attr.aria-disabled]': 'rootContext?.disabled() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext?.disabled() ? "" : undefined',
        '[disabled]': 'rootContext?.disabled()',
        '(click)': 'rootContext?.submit()'
    }
})
export class RdxEditableSubmitTrigger {
    protected readonly rootContext = injectEditableRootContext();
}
