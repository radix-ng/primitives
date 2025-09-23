import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { injectCheckboxRootContext } from './checkbox';

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

    private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
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
