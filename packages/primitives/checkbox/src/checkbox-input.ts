import { DestroyRef, Directive, effect, ElementRef, inject } from '@angular/core';
import { injectCheckboxRootContext } from './checkbox-root';

@Directive({
    selector: 'input[rdxCheckboxInput]',
    host: {
        type: 'checkbox',
        tabindex: '-1',
        'aria-hidden': 'true',
        '[attr.name]': 'rootContext.parent() ? undefined : rootContext.name() || undefined',
        // Only a truly checked box is submitted; `indeterminate` is a property
        // (set below), never a submitted "checked" value.
        '[attr.checked]': 'rootContext.state() === "checked" ? "" : undefined',
        '[checked]': 'rootContext.checked()',
        '[attr.form]': 'rootContext.form() || undefined',
        '[attr.value]': 'rootContext.value()',
        '[required]': 'rootContext.required()',
        '[disabled]': 'rootContext.disabled()',
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
    protected readonly rootContext = injectCheckboxRootContext();

    private readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

    constructor() {
        const unregister = this.rootContext.registerNativeInput(this.input);
        inject(DestroyRef).onDestroy(unregister);

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
            // Track both so the native input mirrors the checkbox and emits change
            // events when either the checked or indeterminate state moves.
            this.rootContext.checked();
            this.input.indeterminate = this.rootContext.indeterminate();

            if (isInitial) {
                isInitial = false;
                return;
            }

            this.input.dispatchEvent(new Event('input', { bubbles: true }));
            this.input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }
}
