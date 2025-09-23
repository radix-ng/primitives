import { Directive, ElementRef, inject } from '@angular/core';
import { injectCheckboxRootContext } from './checkbox';

@Directive({
    selector: 'button[rdxCheckboxButton]',
    host: {
        type: 'button',
        role: 'checkbox',
        '[attr.aria-checked]': 'rootContext.checked() === "indeterminate" ? "mixed" : rootContext.checked()',
        '[attr.aria-required]': 'rootContext.required() || undefined',
        '[attr.data-state]': 'rootContext.state()',
        '[attr.data-disabled]': 'rootContext.disabled() || undefined',
        '[disabled]': 'rootContext.disabled()',
        '[value]': 'rootContext.value()',
        '(click)': 'clicked($event)',
        // According to WAI ARIA, Checkboxes don't activate on enter keypress
        '(keydown.enter)': '$event.preventDefault()'
    }
})
export class RdxCheckboxButtonDirective {
    protected readonly rootContext = injectCheckboxRootContext();

    private elementRef = inject<ElementRef<HTMLButtonElement>>(ElementRef);

    protected clicked(event: MouseEvent) {
        this.rootContext.toggle();

        if (this.rootContext.form() || this.elementRef.nativeElement.closest('form')) {
            // if checkbox is in a form, stop propagation from the button so that we only propagate
            // one click event (from the input). We propagate changes from an input so that native
            // form validation works and form events reflect checkbox updates.
            event.stopPropagation();
        }
    }
}
