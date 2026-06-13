import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { injectComboboxRootContext } from '@radix-ng/primitives/combobox';

/**
 * A polite, atomic live region announcing the "no results" message. Like the combobox empty part, the
 * element stays mounted and visible at all times (never hidden/unmounted) so the transition to empty is
 * announced; only its projected content is rendered conditionally.
 *
 * @group Components
 */
@Component({
    selector: '[rdxAutocompleteEmpty]',
    exportAs: 'rdxAutocompleteEmpty',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (isEmpty()) {
            <ng-content />
        }
    `,
    host: {
        role: 'status',
        'aria-live': 'polite',
        'aria-atomic': 'true',
        // Present only while the message is shown. Lets consumers collapse the always-mounted region
        // (e.g. `data-[empty]:py-6`) without `display:none`/`hidden`, which would break the announcement.
        '[attr.data-empty]': 'isEmpty() ? "" : undefined'
    }
})
export class RdxAutocompleteEmpty {
    protected readonly rootContext = injectComboboxRootContext();

    /** Whether no items match the current query (drives projection of the message). */
    protected readonly isEmpty = computed(() => this.rootContext.visibleCount() === 0);
}
