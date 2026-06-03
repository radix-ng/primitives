import { injectComboboxRootContext } from './combobox-root';
import { computed, Directive } from '@angular/core';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * Optional wrapper around the input and its adornments (icon, clear, trigger). Mirrors the combobox
 * state via `data-*` so the whole group can be styled together (focus ring, disabled, etc.).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxInputGroup]',
    exportAs: 'rdxComboboxInputGroup',
    host: {
        '[attr.data-popup-open]': 'dataAttr(rootContext.open())',
        '[attr.data-disabled]': 'dataAttr(rootContext.disabledState())',
        '[attr.data-required]': 'dataAttr(rootContext.requiredState())',
        '[attr.data-filled]': 'dataAttr(filled())'
    }
})
export class RdxComboboxInputGroup {
    protected readonly rootContext = injectComboboxRootContext();

    /** Whether a value is selected (a non-empty array in multiple mode, or a non-nullish single value). */
    protected readonly filled = computed(() => {
        const value = this.rootContext.value();
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        return value !== null && value !== undefined;
    });

    protected readonly dataAttr = attr;
}
