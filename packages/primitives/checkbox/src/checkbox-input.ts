import { afterNextRender, DestroyRef, Directive, effect, ElementRef, inject } from '@angular/core';
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
        '(click)': 'onClick($event)',
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

    private readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

    constructor() {
        const destroyRef = inject(DestroyRef);
        destroyRef.onDestroy(this.rootContext.registerNativeInput(this.input));

        afterNextRender(() => {
            const owner = this.input.ownerDocument.defaultView;
            if (!owner) return;

            let timer: number | undefined;
            const syncAfterRestore = () => {
                owner.clearTimeout(timer);
                // History traversal can restore checkedness after pageshow, without a change event.
                timer = owner.setTimeout(() => {
                    timer = undefined;
                    this.syncCheckedState();
                }, 0);
            };
            owner.addEventListener('pageshow', syncAfterRestore);
            destroyRef.onDestroy(() => {
                owner.removeEventListener('pageshow', syncAfterRestore);
                owner.clearTimeout(timer);
            });
        });

        effect(() => {
            // Native activation clears this property even when the bound mixed state is unchanged.
            this.rootContext.checked();
            this.input.indeterminate = this.rootContext.indeterminate();
        });
    }

    protected onClick(event: MouseEvent): void {
        event.stopPropagation();
        if (!this.rootContext.toggle(event, this.input.checked)) event.preventDefault();

        // The browser may have rolled back activation. Controlled requests may also be ignored.
        queueMicrotask(() => this.syncCheckedState());
    }

    private syncCheckedState(): void {
        this.input.checked = this.rootContext.checked();
        this.input.indeterminate = this.rootContext.indeterminate();
    }
}
