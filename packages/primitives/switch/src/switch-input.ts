import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { injectSwitchContext } from './switch-context';

/**
 * The hidden native checkbox that mirrors the switch state for form submission and screen readers.
 *
 * @see https://base-ui.com/react/components/switch
 */
@Directive({
    selector: 'input[rdxSwitchInput]',
    exportAs: 'rdxSwitchInput',
    host: {
        type: 'checkbox',
        tabindex: '-1',
        'aria-hidden': 'true',
        '[attr.name]': 'rootContext.name()',
        '[attr.form]': 'rootContext.form()',
        '[attr.value]': 'rootContext.value()',
        '[checked]': 'rootContext.checked()',
        '[disabled]': 'rootContext.disabled()',
        '[attr.required]': 'rootContext.required() ? "" : undefined',
        '[attr.aria-label]': 'rootContext.ariaLabel()',
        '[attr.aria-labelledby]': 'rootContext.ariaLabelledBy()',
        // The hidden form input carries no `data-*` (Base UI parity) — state attributes live on the
        // root button and thumb.
        style: 'transform: translateX(-100%); position: absolute; overflow: hidden; pointer-events: none; opacity: 0; margin: 0;',
        '(blur)': 'rootContext.markAsTouched()'
    }
})
export class RdxSwitchInput {
    protected readonly rootContext = injectSwitchContext();
    private readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

    constructor() {
        const unregister = this.rootContext.registerNativeInput(this.input);
        inject(DestroyRef).onDestroy(unregister);
    }
}
