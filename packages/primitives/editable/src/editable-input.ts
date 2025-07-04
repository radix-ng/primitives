import { afterNextRender, computed, Directive, ElementRef, inject } from '@angular/core';
import { ENTER, watch } from '@radix-ng/primitives/core';
import { injectEditableRootContext } from './editable-root';

@Directive({
    selector: 'input[rdxEditableInput]',
    host: {
        '[attr.aria-label]': '"editable input"',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext?.readonly() ? "" : undefined',
        '[readonly]': 'rootContext?.readonly()',
        '[disabled]': 'disabled()',
        '[maxlength]': 'rootContext?.maxLength()',
        '[attr.value]': 'rootContext?.inputValue()',
        '[attr.placeholder]': 'placeholder()',
        '[attr.hidden]': 'rootContext?.autoResize() ? undefined : !rootContext?.isEditing()',
        '[style.all]': 'rootContext?.autoResize() ? "unset" : undefined',
        '[style.grid-area]': 'rootContext?.autoResize() ? "1 / 1 / auto / auto" : undefined',
        '[style.visibility]': 'rootContext?.autoResize() && !rootContext?.isEditing() ? "hidden" : undefined',

        '(input)': 'handleInput($event)',
        '(keydown.escape)': 'rootContext?.cancel()',
        '(keydown.enter)': 'handleSubmitKeyDown($event)',
        '(keydown.space)': 'handleSubmitKeyDown($event)'
    }
})
export class RdxEditableInput {
    private readonly inputRef = inject(ElementRef).nativeElement;

    protected readonly rootContext = injectEditableRootContext();

    readonly placeholder = computed(() => this.rootContext?.placeholder()?.edit);

    readonly disabled = computed(() => this.rootContext?.disabled());

    constructor() {
        if (this.rootContext?.isEditing !== undefined) {
            watch([this.rootContext?.isEditing], ([value]) => {
                if (value) {
                    setTimeout(() => {
                        this.rootContext?.inputRef()?.focus({ preventScroll: true });
                        if (this.rootContext?.selectOnFocus()) {
                            this.rootContext?.inputRef()?.select();
                        }
                    });
                }
            });
        }

        afterNextRender(() => {
            this.rootContext?.inputRef.set(this.inputRef as HTMLInputElement);

            if (this.rootContext?.startWithEditMode()) {
                this.rootContext?.inputRef()?.focus({ preventScroll: true });
                if (this.rootContext?.selectOnFocus()) {
                    this.rootContext?.inputRef()?.select();
                }
            }
        });
    }

    handleInput(event: Event) {
        this.rootContext?.inputValue.set((event.target as HTMLInputElement).value);
    }

    handleSubmitKeyDown(event: KeyboardEvent) {
        if (
            (this.rootContext?.submitMode() === 'enter' || this.rootContext?.submitMode() === 'both') &&
            event.key === ENTER &&
            !event.shiftKey &&
            !event.metaKey
        ) {
            this.rootContext?.submit();
        }
    }
}
