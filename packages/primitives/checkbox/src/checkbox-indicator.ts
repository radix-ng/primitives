import { booleanAttribute, computed, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { BooleanInput, useRenderLifecycle, watch } from '@radix-ng/primitives/core';
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
        '[attr.data-required]': 'rootContext.required() ? "" : undefined',
        '[attr.data-starting-style]': 'lifecycle.status() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'lifecycle.status() === "ending" ? "" : undefined',
        '[style.display]': '!keepMounted() && !isVisible() && !lifecycle.mounted() ? "none" : null',
        '[style.pointer-events]': '"none"'
    }
})
export class RdxCheckboxIndicatorDirective {
    protected readonly rootContext = injectCheckboxRootContext();

    /** Keep the indicator in layout after it has finished animating out. */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly isVisible = computed(() => this.rootContext.checked() || this.rootContext.indeterminate());
    protected readonly lifecycle = useRenderLifecycle(undefined, {
        open: this.isVisible,
        debugName: 'RdxCheckboxIndicator'
    });

    constructor() {
        const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        inject(DestroyRef).onDestroy(this.lifecycle.registerElement(element));
        watch([this.isVisible], ([visible]) => this.lifecycle.start(visible), { defer: true });
    }
}
