import { computed, Directive } from '@angular/core';
import { injectEditableRootContext } from './editable-root';

@Directive({
    selector: 'span[rdxEditablePreview]',
    exportAs: 'rdxEditablePreview',
    host: {
        tabindex: '0',
        '[attr.data-placeholder-shown]': 'rootContext?.isEditing() ? undefined : ""',
        '[attr.hidden]': 'rootContext?.autoResize() ? undefined : rootContext?.isEditing()',

        '[style.white-space]': 'rootContext?.autoResize() ? "pre" : undefined',
        '[style.user-select]': 'rootContext?.autoResize() ? "none" : undefined',
        '[style.grid-area]': 'rootContext?.autoResize() ? "1 / 1 / auto / auto" : undefined',
        '[style.visibility]': 'rootContext?.autoResize() && rootContext?.isEditing() ? "hidden" : undefined',
        '[style.overflow]': 'rootContext?.autoResize() ? "hidden" : undefined',
        '[style.text-overflow]': 'rootContext?.autoResize() ? "ellipsis" : undefined',

        '(focusin)': 'handleFocus()',
        '(dblclick)': 'handleDoubleClick()'
    }
})
export class RdxEditablePreview {
    protected readonly rootContext = injectEditableRootContext();

    readonly placeholder = computed(() => {
        return this.rootContext?.placeholder()?.preview;
    });

    handleFocus() {
        if (this.rootContext?.activationMode() === 'focus') {
            this.rootContext?.edit();
        }
    }

    handleDoubleClick() {
        if (this.rootContext?.activationMode() === 'dblclick') {
            this.rootContext?.edit();
        }
    }
}
