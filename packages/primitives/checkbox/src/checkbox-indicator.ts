import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { injectCheckboxIndicatorPresence } from './checkbox-indicator-presence';
import { injectCheckboxRootContext } from './checkbox-root';

@Directive({
    selector: '[rdxCheckboxIndicator]',
    host: {
        '[attr.data-checked]': 'rootContext.checked() && !rootContext.indeterminate() ? "" : undefined',
        '[attr.data-unchecked]': '!rootContext.checked() && !rootContext.indeterminate() ? "" : undefined',
        '[attr.data-indeterminate]': 'rootContext.indeterminate() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.data-invalid]': 'rootContext.displayValid() === false ? "" : undefined',
        '[attr.data-valid]': 'rootContext.displayValid() === true ? "" : undefined',
        '[attr.data-touched]': 'rootContext.touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'rootContext.dirtyState() ? "" : undefined',
        '[attr.data-filled]': 'rootContext.filledState() ? "" : undefined',
        '[attr.data-focused]': 'rootContext.focusedState() ? "" : undefined',
        '[attr.data-required]': 'rootContext.required() ? "" : undefined',
        '[attr.data-starting-style]': 'transition?.status() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'transition?.status() === "ending" ? "" : undefined',
        '[style.pointer-events]': '"none"'
    }
})
export class RdxCheckboxIndicatorDirective {
    protected readonly rootContext = injectCheckboxRootContext();

    protected readonly transition = (() => {
        const presence = injectCheckboxIndicatorPresence(true);
        return presence?.root === this.rootContext ? presence.transition : undefined;
    })();

    constructor() {
        const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        const unregister = this.transition?.registerElement(element);
        if (unregister) inject(DestroyRef).onDestroy(unregister);
    }
}
