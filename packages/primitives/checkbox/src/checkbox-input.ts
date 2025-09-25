import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { injectCheckboxRootContext } from './checkbox-root';

@Directive({
    selector: 'input[rdxCheckboxInput]',
    host: {
        type: 'checkbox',
        tabindex: '-1',
        'aria-hidden': 'true',
        '[attr.name]': 'rootContext.name() || undefined',
        '[attr.checked]': 'rootContext.checked()',
        '[attr.form]': 'rootContext.form() || undefined',
        '[value]': 'rootContext.value()',
        '[required]': 'rootContext.required() || undefined',
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
    protected readonly rootContext = injectCheckboxRootContext()!;

    private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        /**
         * Sets up an observer to bubble native input events when the underlying "checked" attribute changes.
         *
         * Why this exists
         * - The checkbox input in this directive is visually hidden and controlled by the Radix checkbox state.
         * - When Radix changes the checked state, it updates the input's DOM attribute ("checked").
         * - Some forms and frameworks rely on native events (click/change) from the input to sync value, validity and
         *   form state. If the attribute changes programmatically without a user click, no event is fired by default.
         */
        afterNextRender(() => {
            const mutationObserver = new MutationObserver(() => {
                this.elementRef.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
            });
            mutationObserver.observe(this.elementRef.nativeElement, {
                attributes: true,
                attributeFilter: ['checked']
            });

            this.destroyRef.onDestroy(() => mutationObserver.disconnect());
        });
    }
}
