import { injectEditableRootContext } from './editable-root';
import { afterNextRender, afterRenderEffect, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { ENTER } from '@radix-ng/primitives/core';

@Directive({
    selector: 'input[rdxEditableInput]',
    host: {
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-required]': 'rootContext.required() ? "true" : undefined',
        '[attr.aria-invalid]': 'rootContext.invalidState() ? "true" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined',
        '[readonly]': 'rootContext.readonly()',
        '[required]': 'rootContext.required()',
        '[attr.disabled]': 'disabled() ? "" : undefined',
        '[attr.maxlength]': 'rootContext.maxLength()',
        '[attr.value]': 'rootContext.inputValue()',
        '[attr.placeholder]': 'placeholder()',
        '[attr.data-auto-resize]': 'rootContext.autoResize() ? "" : undefined',
        '[attr.hidden]': 'rootContext.autoResize() || rootContext.isEditing() ? undefined : ""',

        // Auto-resize overlay mechanism (see RdxEditableArea): strip native chrome with `all: unset`
        // and share the preview's grid cell so the input inherits its measured width.
        '[style.all]': 'rootContext.autoResize() ? "unset" : undefined',
        '[style.grid-area]': 'rootContext.autoResize() ? "1 / 1 / auto / auto" : undefined',
        '[style.visibility]': 'rootContext.autoResize() && !rootContext.isEditing() ? "hidden" : undefined',

        '(input)': 'handleInput($event)',
        '(keydown.escape)': 'rootContext.cancel()',
        '(keydown.enter)': 'handleSubmitKeyDown($event)'
    }
})
export class RdxEditableInput {
    private readonly inputRef = inject(ElementRef).nativeElement as HTMLInputElement;

    protected readonly rootContext = injectEditableRootContext();

    /** Accessible label for the input. Override to localize. */
    readonly ariaLabel = input<string>('editable input', { alias: 'aria-label' });

    readonly placeholder = computed(() => this.rootContext.placeholder().edit);

    readonly disabled = computed(() => this.rootContext.disabled());

    constructor() {
        afterNextRender(() => {
            this.rootContext.inputRef.set(this.inputRef);
        });

        // Focus (and optionally select) the input whenever it enters edit mode.
        // Runs after render so the input is no longer hidden, and is browser-only (SSR-safe).
        afterRenderEffect(() => {
            const editing = this.rootContext.isEditing();
            const el = this.rootContext.inputRef();
            if (editing && el) {
                el.focus({ preventScroll: true });
                if (this.rootContext.selectOnFocus()) {
                    el.select();
                }
            }
        });
    }

    handleInput(event: Event) {
        this.rootContext.inputValue.set((event.target as HTMLInputElement).value);
    }

    handleSubmitKeyDown(event: Event) {
        const keyEvent = event as KeyboardEvent;
        if (
            (this.rootContext.submitMode() === 'enter' || this.rootContext.submitMode() === 'both') &&
            keyEvent.key === ENTER &&
            !keyEvent.shiftKey &&
            !keyEvent.metaKey
        ) {
            this.rootContext.submit(event);
        }
    }
}
