import { Directive, ElementRef, inject } from '@angular/core';
import { injectCheckboxRootContext } from './checkbox-root';

/**
 * Directive: rdxCheckboxButton
 * Purpose: Turns a native <button> into an accessible checkbox control bound to the Radix Checkbox context.
 * It mirrors the checkbox state via ARIA/data attributes, toggles on click, and prevents Enter activation per WAI-ARIA.
 * In forms, it stops the button's click from bubbling so only the hidden input emits the native event used for form/validator integration.
 */
@Directive({
    selector: 'button[rdxCheckboxButton]',
    host: {
        type: 'button',
        role: 'checkbox',
        '[attr.aria-checked]': 'rootContext.checked() === "indeterminate" ? "mixed" : rootContext.checked()',
        '[attr.aria-required]': 'rootContext.required() || undefined',
        '[attr.aria-readonly]': 'rootContext.readonly() || undefined',
        '[attr.data-state]': 'rootContext.state()',
        '[attr.data-disabled]': 'rootContext.disabled() || undefined',
        '[attr.data-readonly]': 'rootContext.readonly() || undefined',
        '[disabled]': 'rootContext.disabled()',
        '[value]': 'rootContext.value()',
        '(click)': 'clicked($event)',
        // According to WAI ARIA, Checkboxes don't activate on enter keypress
        '(keydown.enter)': '$event.preventDefault()'
    }
})
export class RdxCheckboxButtonDirective {
    protected readonly rootContext = injectCheckboxRootContext()!;

    private readonly elementRef = inject<ElementRef<HTMLButtonElement>>(ElementRef);

    protected clicked(event: MouseEvent) {
        if (event.defaultPrevented || this.rootContext.readonly()) {
            return;
        }

        this.rootContext.toggle();

        if (this.rootContext.form() || this.elementRef.nativeElement.closest('form')) {
            // if checkbox is in a form, stop propagation from the button so that we only propagate
            // one click event (from the input). We propagate changes from an input so that native
            // form validation works and form events reflect checkbox updates.
            event.stopPropagation();
        }
    }
}
