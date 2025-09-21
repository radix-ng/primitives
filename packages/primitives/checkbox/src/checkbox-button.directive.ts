import { Directive, ElementRef, inject } from '@angular/core';
import { injectCheckboxRootContext } from './checkbox.directive';

@Directive({
    selector: 'button[rdxCheckboxButton]',
    host: {
        type: 'button',
        role: 'checkbox',
        '[attr.aria-checked]': 'context.checked() === "indeterminate" ? "mixed" : context.checked()',
        '[attr.aria-required]': 'context.required() || undefined',
        '[attr.data-state]': 'context.state()',
        '[attr.data-disabled]': 'context.disabled() || undefined',
        '[disabled]': 'context.disabled()',
        '[value]': 'context.value()',
        '(click)': 'clicked($event)',
        // According to WAI ARIA, Checkboxes don't activate on enter keypress
        '(keydown.enter)': '$event.preventDefault()'
    }
})
export class RdxCheckboxButtonDirective {
    protected readonly context = injectCheckboxRootContext();

    private elementRef = inject<ElementRef<HTMLButtonElement>>(ElementRef);

    protected clicked(event: MouseEvent) {
        this.context.toggle();

        if (this.context.form() || this.elementRef.nativeElement.closest('form')) {
            // if checkbox is in a form, stop propagation from the button so that we only propagate
            // one click event (from the input). We propagate changes from an input so that native
            // form validation works and form events reflect checkbox updates.
            event.stopPropagation();
        }
    }
}
