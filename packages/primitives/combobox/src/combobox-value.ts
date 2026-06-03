import { injectComboboxRootContext } from './combobox-root';
import { computed, Directive, input } from '@angular/core';
import { AcceptableValue, isNullish } from '@radix-ng/primitives/core';

/**
 * Renders the current selection's label(s) — typically inside a {@link RdxComboboxTrigger} for a
 * select-like control. Read `slotText()` in the template, or compose your own from `selectedLabels()`.
 * Exposes `data-placeholder` while nothing is selected.
 *
 * @example
 * <span #value="rdxComboboxValue" rdxComboboxValue placeholder="Select…">{{ value.slotText() }}</span>
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxValue]',
    exportAs: 'rdxComboboxValue',
    host: {
        '[attr.data-placeholder]': 'isEmpty() ? "" : undefined'
    }
})
export class RdxComboboxValue {
    private readonly rootContext = injectComboboxRootContext();

    /** Text shown when there is no selection. */
    readonly placeholder = input<string>();

    /** The label(s) of the current selection, resolved via the root's `itemToStringLabel`/items. */
    readonly selectedLabels = computed<string[]>(() => {
        const value = this.rootContext.value();
        if (Array.isArray(value)) {
            return value.map((v) => this.rootContext.labelFor(v)).filter(Boolean);
        }
        return isNullish(value) ? [] : [this.rootContext.labelFor(value as AcceptableValue)].filter(Boolean);
    });

    readonly isEmpty = computed(() => this.selectedLabels().length === 0);

    /** The selection joined for display, or the `placeholder` when empty. */
    readonly slotText = computed(() => {
        const labels = this.selectedLabels();
        return labels.length ? labels.join(', ') : (this.placeholder() ?? '');
    });
}
