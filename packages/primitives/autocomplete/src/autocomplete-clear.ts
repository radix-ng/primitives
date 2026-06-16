import { computed, Directive, inject } from '@angular/core';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import { RdxAutocompleteRoot } from './autocomplete-root';

/**
 * Clears the input value. Hidden when there is nothing to clear.
 *
 * @group Components
 */
@Directive({
    selector: 'button[rdxAutocompleteClear]',
    exportAs: 'rdxAutocompleteClear',
    hostDirectives: [RdxFloatingInsideElement],
    host: {
        type: 'button',
        tabindex: '-1',
        'aria-label': 'Clear',
        '[hidden]': 'isEmpty()',
        '[attr.disabled]': 'isDisabled() ? "" : undefined',
        '(click)': 'onClick()'
    }
})
export class RdxAutocompleteClear {
    protected readonly root = inject(RdxAutocompleteRoot);

    protected readonly isEmpty = computed(() => !this.root.value());

    /** Disabled when the control is disabled or read-only (clearing is a mutation). */
    protected readonly isDisabled = computed(() => this.root.disabledState() || this.root.readOnly());

    onClick(): void {
        this.root.clearValue();
    }
}
