import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { injectComboboxRootContext } from './combobox-root';

/**
 * A polite, atomic live region announcing the "no results" message. Mirrors Base UI: the element
 * stays **mounted and visible at all times** so screen readers reliably announce the transition to
 * empty — only its *content* is rendered conditionally (projected when nothing matches, removed
 * otherwise). It must never be hidden/unmounted (`hidden`, `display:none`, `aria-hidden`, `@if`):
 * pulling the region out of the accessibility tree at the same instant its text appears is exactly
 * what suppresses the announcement.
 *
 * @group Components
 */
@Component({
    selector: '[rdxComboboxEmpty]',
    exportAs: 'rdxComboboxEmpty',
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
export class RdxComboboxEmpty {
    protected readonly rootContext = injectComboboxRootContext();

    /** Whether no items match the current query (drives projection of the message). */
    protected readonly isEmpty = computed(() => this.rootContext.visibleCount() === 0);
}
