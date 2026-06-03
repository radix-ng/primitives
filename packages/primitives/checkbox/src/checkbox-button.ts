import { injectCheckboxGroupContext } from './checkbox-group';
import { injectCheckboxRootContext } from './checkbox-root';
import { computed, Directive, effect, ElementRef, inject } from '@angular/core';

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
        '[attr.aria-checked]': 'rootContext.indeterminate() ? "mixed" : rootContext.checked()',
        '[attr.aria-controls]': 'ariaControls()',
        '[attr.aria-disabled]': 'rootContext.disabled() ? "true" : undefined',
        '[attr.aria-required]': 'rootContext.required() || undefined',
        '[attr.aria-readonly]': 'rootContext.readonly() || undefined',
        '[attr.aria-invalid]': 'rootContext.invalidState() ? "true" : undefined',
        '[attr.data-checked]': 'rootContext.checked() && !rootContext.indeterminate() ? "" : undefined',
        '[attr.data-unchecked]': '!rootContext.checked() && !rootContext.indeterminate() ? "" : undefined',
        '[attr.data-indeterminate]': 'rootContext.indeterminate() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.data-required]': 'rootContext.required() ? "" : undefined',
        '[attr.data-invalid]': 'rootContext.invalidState() ? "" : undefined',
        '[attr.data-valid]': 'rootContext.invalidState() ? undefined : ""',
        '[attr.data-touched]': 'rootContext.touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'rootContext.dirtyState() ? "" : undefined',
        '(click)': 'clicked($event)',
        // According to WAI ARIA, Checkboxes don't activate on enter keypress
        '(keydown.enter)': '$event.preventDefault()'
    }
})
export class RdxCheckboxButtonDirective {
    protected readonly rootContext = injectCheckboxRootContext();
    private readonly group = injectCheckboxGroupContext(true);

    private readonly elementRef = inject<ElementRef<HTMLButtonElement>>(ElementRef);

    /** A `parent` checkbox lists the ids of the children it controls. */
    protected readonly ariaControls = computed(() =>
        this.group && this.rootContext.parent() ? this.group.controlledIds() : undefined
    );

    constructor() {
        // A child checkbox in a group exposes its control id so the parent can reference it via
        // `aria-controls`. Use the consumer's id when present, otherwise derive a stable one.
        effect((onCleanup) => {
            const group = this.group;
            const name = this.rootContext.name();
            if (!group || this.rootContext.parent() || name === undefined) {
                return;
            }

            const el = this.elementRef.nativeElement;
            if (!el.id) {
                el.id = group.controlId(name);
            }
            onCleanup(group.registerControl(name, el.id));
        });
    }

    protected clicked(event: MouseEvent) {
        if (event.defaultPrevented || this.rootContext.disabled() || this.rootContext.readonly()) {
            return;
        }

        this.rootContext.toggle(event);

        if (this.rootContext.form() || this.elementRef.nativeElement.closest('form')) {
            // if checkbox is in a form, stop propagation from the button so that we only propagate
            // one click event (from the input). We propagate changes from an input so that native
            // form validation works and form events reflect checkbox updates.
            event.stopPropagation();
        }
    }
}
