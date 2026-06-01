import { Directive, effect, ElementRef, inject } from '@angular/core';
import { injectCheckboxRootContext, isIndeterminate } from './checkbox-root';

@Directive({
    selector: 'input[rdxCheckboxInput]',
    host: {
        type: 'checkbox',
        tabindex: '-1',
        'aria-hidden': 'true',
        '[attr.name]': 'rootContext.name() || undefined',
        // Only a truly checked box is submitted; `indeterminate` is a property
        // (set below), never a submitted "checked" value.
        '[attr.checked]': 'rootContext.state() === "checked" ? "" : undefined',
        '[attr.form]': 'rootContext.form() || undefined',
        '[attr.value]': 'rootContext.value()',
        '[required]': 'rootContext.required() || undefined',
        '[attr.disabled]': 'rootContext.disabled() ? "" : undefined',
        '[style]': `{
          position: 'absolute',
          pointerEvents: 'none',
          opacity: 0,
          margin: 0,
          inset: 0,
          transform: 'translateX(-100%)',
        }`
    }
})
export class RdxCheckboxInputDirective {
    protected readonly rootContext = injectCheckboxRootContext()!;

    private readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

    constructor() {
        let isInitial = true;

        /**
         * Keeps the hidden native input in sync so form submission, native
         * validation and form events reflect the checkbox state.
         *
         * - `indeterminate` is a native property (not a submittable value), so we
         *   mirror it here rather than via an attribute.
         * - On every change (but not the initial render) we emit bubbling
         *   `input`/`change` events so native form listeners react. We do NOT
         *   dispatch a `click`: a click on a checkbox runs the toggle activation
         *   behavior and would desync the input from the bound state.
         */
        effect(() => {
            const checked = this.rootContext.checked();

            this.input.indeterminate = isIndeterminate(checked);

            if (isInitial) {
                isInitial = false;
                return;
            }

            this.input.dispatchEvent(new Event('input', { bubbles: true }));
            this.input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }
}
