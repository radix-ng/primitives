import { afterRenderEffect, computed, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { serializeItemValue } from '@radix-ng/primitives/core';
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
        'data-rdx-native-input': '',
        '[attr.id]': 'inputId()',
        '[attr.name]': 'name()',
        '[attr.form]': 'form()',
        '[attr.required]': 'required() ? "" : undefined',
        '[attr.disabled]': 'disabled() ? "" : undefined',
        '[attr.checked]': 'checked() ? "" : undefined',
        '[checked]': 'checked()',
        '[attr.value]': 'value()',
        '(click)': 'onInputClick($event)',
        '(change)': 'onInputChange($event)',
        '(focus)': 'onFocus()',
        style: 'position: absolute; width: 1px; height: 1px; clip-path: inset(50%); pointer-events: none; opacity: 0; margin: 0;'
    }
})
export class RdxRadioItemInputDirective {
    private readonly rootContext = injectRadioRootContext();
    private readonly itemContext = injectRadioItemContext();
    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

    /** ID for an explicit native label. Defaults to the item ID with an `-input` suffix. */
    readonly id = input<string>();

    protected readonly inputId = computed(() => this.id() ?? `${this.itemContext.id()}-input`);

    readonly name = computed(() => this.rootContext.name());
    readonly form = computed(() => this.rootContext.form());
    readonly value = computed(() => serializeItemValue(this.itemContext.value()));
    readonly checked = computed(() => this.itemContext.checkedState());
    readonly required = computed(() => this.itemContext.requiredState());
    readonly disabled = computed(() => this.itemContext.disabledState());

    constructor() {
        const unregister = this.itemContext.registerNativeInput({ element: this.element, id: this.inputId });
        inject(DestroyRef).onDestroy(unregister);

        let previousForm: string | undefined;
        afterRenderEffect(() => {
            const form = this.form();
            if (form === previousForm) return;
            previousForm = form;

            // Firefox can retain stale valueMissing after a form attribute change.
            // Rejoin the named radio group so the browser recomputes its native validity.
            const name = this.element.name;
            if (name) {
                this.element.name = '';
                this.element.name = name;
            }
        });
    }

    protected onFocus(): void {
        this.itemContext.focus();
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
        if (this.element.checked && !this.checked() && !this.itemContext.requestSelection(event)) {
            this.rootContext.syncNativeInputs();
        }
    }
}
