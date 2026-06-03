import { RdxAutocompleteRoot } from './autocomplete-root';
import { computed, Directive, inject, input } from '@angular/core';

/**
 * Renders the current input value as text. Useful for a read-only display of the committed value.
 * Read `slotText()` in the template. Exposes `data-placeholder` while the value is empty.
 *
 * @example
 * <span #value="rdxAutocompleteValue" rdxAutocompleteValue placeholder="Empty">{{ value.slotText() }}</span>
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteValue]',
    exportAs: 'rdxAutocompleteValue',
    host: {
        '[attr.data-placeholder]': 'isEmpty() ? "" : undefined'
    }
})
export class RdxAutocompleteValue {
    private readonly root = inject(RdxAutocompleteRoot);

    /** Text shown when the value is empty. */
    readonly placeholder = input<string>();

    readonly isEmpty = computed(() => !this.root.value());

    /** The current input value, or the `placeholder` when empty. */
    readonly slotText = computed(() => this.root.value() || (this.placeholder() ?? ''));
}
