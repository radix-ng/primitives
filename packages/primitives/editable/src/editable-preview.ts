import { injectEditableRootContext } from './editable-root';
import { afterNextRender, computed, Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: 'span[rdxEditablePreview]',
    exportAs: 'rdxEditablePreview',
    host: {
        tabindex: '0',
        '[attr.data-placeholder-shown]': 'rootContext.isEditing() ? undefined : ""',
        '[attr.data-auto-resize]': 'rootContext.autoResize() ? "" : undefined',
        '[attr.hidden]': '!rootContext.autoResize() && rootContext.isEditing() ? "" : undefined',

        // Auto-resize overlay mechanism (see RdxEditableArea): share the grid cell with the input
        // and stay measurable so the area keeps the preview's width while editing. `white-space: pre`
        // keeps that measured width stable. Cosmetics (overflow, ellipsis, user-select) are left to
        // the consumer via [data-auto-resize].
        '[style.grid-area]': 'rootContext.autoResize() ? "1 / 1 / auto / auto" : undefined',
        '[style.white-space]': 'rootContext.autoResize() ? "pre" : undefined',
        '[style.visibility]': 'rootContext.autoResize() && rootContext.isEditing() ? "hidden" : undefined',

        '(focusin)': 'handleFocus()',
        '(dblclick)': 'handleDoubleClick()'
    }
})
export class RdxEditablePreview {
    private readonly elementRef = inject(ElementRef);

    protected readonly rootContext = injectEditableRootContext();

    readonly placeholder = computed(() => {
        return this.rootContext.placeholder().preview;
    });

    constructor() {
        afterNextRender(() => {
            this.rootContext.previewRef.set(this.elementRef.nativeElement);
        });
    }

    handleFocus() {
        // Ignore focus that we restored programmatically after leaving edit mode,
        // otherwise focus-mode activation would immediately re-open the editor.
        if (this.rootContext.activationMode() === 'focus' && this.rootContext.canActivateOnFocus()) {
            this.rootContext.edit();
        }
    }

    handleDoubleClick() {
        if (this.rootContext.activationMode() === 'dblclick') {
            this.rootContext.edit();
        }
    }
}
