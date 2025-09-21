import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { injectCheckboxRootContext } from './checkbox.directive';

@Directive({
    selector: 'input[rdxCheckboxInput]',
    host: {
        type: 'checkbox',
        tabindex: '-1',
        'aria-hidden': 'true',
        '[attr.name]': 'context.name() || undefined',
        '[attr.checked]': 'context.checked()',
        '[attr.form]': 'context.form() || undefined',
        '[value]': 'context.value()',
        '[required]': 'context.required() || undefined',
        '[disabled]': 'context.disabled()',
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
    protected readonly context = injectCheckboxRootContext();

    constructor() {
        const elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
        const destroyRef = inject(DestroyRef);

        afterNextRender(() => {
            const mutationObserver = new MutationObserver(() => {
                elementRef.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
            });
            mutationObserver.observe(elementRef.nativeElement, {
                attributes: true,
                attributeFilter: ['checked']
            });

            destroyRef.onDestroy(() => mutationObserver.disconnect());
        });
    }
}
