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
        '(click)': 'onInputClick($event)',
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
    }

    /**
     * A native label click preselects its radio before handlers run. On refusal, roll back
     * the checked properties and cancel the browser's input/change notifications.
     */
    protected onInputClick(event: MouseEvent): void {
        event.stopPropagation();
        if (!this.itemContext.requestSelection(event)) {
            event.preventDefault();
            this.rootContext.syncNativeInputs();
        }
    }

    /** Covers changes that arrive without a click, including native autofill. */
    protected onInputChange(event: Event): void {
        if (this.input.checked && !this.checked() && !this.itemContext.requestSelection(event)) {
            this.rootContext.syncNativeInputs();
        }
    }
}
