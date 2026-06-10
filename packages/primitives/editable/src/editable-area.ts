import { Directive } from '@angular/core';
import { injectEditableRootContext } from './editable-root';

@Directive({
    selector: '[rdxEditableArea]',
    host: {
        '[attr.data-placeholder-shown]': 'rootContext.isEditing() ? undefined : ""',
        '[attr.data-focus]': 'rootContext.isEditing() ? "" : undefined',
        '[attr.data-empty]': 'rootContext.isEmpty() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.data-auto-resize]': 'rootContext.autoResize() ? "" : undefined',
        // Auto-resize overlays the preview and input in a single grid cell so the area
        // sizes to the larger of the two. This is the layout mechanism for the feature,
        // not theming; consumers style everything else via the data-* attributes above.
        '[style.display]': 'rootContext.autoResize() ? "inline-grid" : undefined'
    }
})
export class RdxEditableArea {
    protected readonly rootContext = injectEditableRootContext();
}
