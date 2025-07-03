import { computed, Directive, ElementRef, inject, OnInit } from '@angular/core';
import { watch } from '@radix-ng/primitives/core';
import { injectEditableRootContext } from './editable-root';

@Directive({
    selector: 'input[rdxEditableInput]',
    host: {
        '[attr.aria-label]': '"editable input"',
        '[attr.value]': 'rootContext?.inputValue()',
        '[attr.placeholder]': 'placeholder()',
        '[attr.hidden]': 'rootContext?.autoResize() ? undefined : !rootContext?.isEditing()',
        '[style.all]': 'rootContext?.autoResize() ? "unset" : undefined',
        '[style.grid-area]': 'rootContext?.autoResize() ? "1 / 1 / auto / auto" : undefined',
        '[style.visibility]': 'rootContext?.autoResize() && !rootContext?.isEditing() ? "hidden" : undefined',

        '(input)': 'handleInput($event)'
    }
})
export class RdxEditableInput implements OnInit {
    private readonly inputRef = inject(ElementRef).nativeElement;

    protected readonly rootContext = injectEditableRootContext();

    readonly placeholder = computed(() => this.rootContext?.placeholder()?.edit);

    constructor() {
        if (this.rootContext?.isEditing !== undefined) {
            watch([this.rootContext?.isEditing], ([value]) => {
                if (value) {
                    setTimeout(() => {
                        // this.rootContext?.inputRef()?.focus({ preventScroll: true });
                        // if (this.rootContext?.selectOnFocus()) {
                        //     this.rootContext?.inputRef()?.select();
                        // }
                    });
                }
            });
        }
    }

    ngOnInit() {
        this.rootContext?.inputRef.set(this.inputRef.value as HTMLInputElement);

        if (this.rootContext?.startWithEditMode()) {
            this.rootContext?.inputRef()?.focus({ preventScroll: true });
            if (this.rootContext?.selectOnFocus()) {
                this.rootContext?.inputRef()?.select();
            }
        }
    }

    handleInput(event: Event) {
        this.rootContext?.inputValue.set((event.target as HTMLInputElement).value);
    }
}
