import { computed, Directive, input } from '@angular/core';
import { injectPaginationRootContext } from './pagination-context.token';

// as Button
@Directive({
    selector: '[rdxPaginationListItem]',
    host: {
        '[data-type]': '"page"',

        '[attr.aria-label]': '"Page " + value()',
        '[attr.aria-current]': 'isSelected() ? "page" : undefined',
        '[attr.data-selected]': 'isSelected() ? true : undefined',

        '[disabled]': 'disabled()',
        '(click)': 'onClick()'
    }
})
export class RdxPaginationListItemDirective {
    private readonly rootContext = injectPaginationRootContext();

    readonly value = input<number>();

    readonly disabled = computed(() => this.rootContext.disabled());

    readonly isSelected = computed(() => this.rootContext.page() === this.value());

    onClick() {
        const pageValue = this.value();
        if (!this.disabled() && typeof pageValue === 'number') {
            this.rootContext.onPageChange(pageValue);
        }
    }
}
