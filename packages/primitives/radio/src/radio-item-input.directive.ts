import { computed, Directive, effect, ElementRef, inject } from '@angular/core';
import { injectRadioItemContext } from './radio-item.directive';
import { injectRadioRootContext } from './radio-root.directive';

/**
 * The hidden native radio input that mirrors the item state for form submission, native validation,
 * and `<label>` activation. Place it inside an `rdxRadioItem`.
 *
 * @see https://base-ui.com/react/components/radio
 */
@Directive({
    selector: 'input[rdxRadioItemInput]',
    exportAs: 'rdxRadioItemInput',
    host: {
        type: 'radio',
        tabindex: '-1',
        'aria-hidden': 'true',
        '[attr.name]': 'name()',
        '[attr.form]': 'form()',
        '[attr.required]': 'required() ? "" : undefined',
        '[attr.disabled]': 'disabled() ? "" : undefined',
        '[attr.checked]': 'checked() ? "" : undefined',
        '[checked]': 'checked()',
        '[attr.value]': 'value()',
        '(change)': 'onInputChange($event)',
        style: 'transform: translateX(-100%); position: absolute; pointer-events: none; opacity: 0; margin: 0; inset: 0;'
    }
})
export class RdxRadioItemInputDirective {
    private readonly rootContext = injectRadioRootContext();
    private readonly itemContext = injectRadioItemContext();
    private readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

    readonly name = computed(() => this.rootContext.name());
    readonly form = computed(() => this.rootContext.form());
    readonly value = computed(() => this.itemContext.value() ?? undefined);
    readonly checked = computed(() => this.itemContext.checkedState());
    readonly required = computed(() => this.itemContext.requiredState());
    readonly disabled = computed(() => this.itemContext.disabledState());

    constructor() {
        effect((onCleanup) => {
            onCleanup(this.rootContext.registerNativeInput(this.itemContext.value(), this.input));
        });

        let isInitial = true;

        effect(() => {
            const checked = this.checked();

            if (isInitial) {
                isInitial = false;
                return;
            }

            if (checked) {
                this.input.dispatchEvent(new Event('input', { bubbles: true }));
                this.input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

    /**
     * Selects this item when the native input is checked — covers `<label>` activation,
     * where clicking the label toggles the hidden radio input rather than the visible item.
     * `select()` is a no-op when the value is already current, so the programmatic
     * `change` dispatched above does not re-trigger selection.
     * @ignore
     */
    protected onInputChange(event: Event): void {
        if (this.input.checked) {
            this.rootContext.select(this.itemContext.value(), event);
        }
    }
}
