import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { injectCheckboxRootContext } from './checkbox-root';

@Directive({
    selector: 'input[rdxCheckboxInput]',
    host: {
        type: 'checkbox',
        tabindex: '-1',
        'aria-hidden': 'true',
        'data-rdx-native-input': '',
        '[attr.aria-describedby]': 'rootContext.describedBy()',
        '[attr.aria-invalid]': '!rootContext.disabled() && rootContext.displayValid() === false ? "true" : undefined',
        '[attr.name]': 'rootContext.parent() ? undefined : rootContext.name() || undefined',
        '[attr.checked]': 'rootContext.checked() ? "" : undefined',
        '[checked]': 'rootContext.checked()',
        '(click)': 'rootContext.onNativeInputClick(input, $event)',
        '(focus)': 'rootContext.focus()',
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

    protected readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

    constructor() {
        inject(DestroyRef).onDestroy(this.rootContext.registerNativeInput(this.input));
    }
}
