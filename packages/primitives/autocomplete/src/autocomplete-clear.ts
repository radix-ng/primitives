import { computed, Directive, inject } from '@angular/core';
import { RdxDismissableLayerBranch } from '@radix-ng/primitives/dismissable-layer';
import { RdxAutocompleteRoot } from './autocomplete-root';

/**
 * Clears the input value. Hidden when there is nothing to clear.
 *
 * @group Components
 */
@Directive({
    selector: 'button[rdxAutocompleteClear]',
    exportAs: 'rdxAutocompleteClear',
    hostDirectives: [RdxDismissableLayerBranch],
    host: {
        type: 'button',
        tabindex: '-1',
        'aria-label': 'Clear',
        '[hidden]': 'isEmpty()',
        '[attr.disabled]': 'root.disabledState() ? "" : undefined',
        '(click)': 'onClick()'
    }
})
export class RdxAutocompleteClear {
    protected readonly root = inject(RdxAutocompleteRoot);

    protected readonly isEmpty = computed(() => !this.root.value());

    onClick(): void {
        this.root.clearValue();
    }
}
