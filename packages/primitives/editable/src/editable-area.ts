import { Directive } from '@angular/core';
import { injectEditableRootContext } from './editable-root';

@Directive({
    selector: '[rdxEditableArea]',
    host: {
        '[attr.data-placeholder-shown]': 'rootContext?.isEditing() ? undefined : ""',
        '[attr.data-focus]': 'rootContext?.isEditing() ? "" : undefined',
        '[attr.data-focused]': 'rootContext?.isEditing() ? "" : undefined',
        '[attr.data-empty]': 'rootContext?.isEmpty() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext?.readonly() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext?.disabled() ? "" : undefined',
        '[style.display]': 'rootContext?.autoResize() ? "inline-grid" : undefined'
    }
})
export class RdxEditableArea {
    protected readonly rootContext = injectEditableRootContext();
}
