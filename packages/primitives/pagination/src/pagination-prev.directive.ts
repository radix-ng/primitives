import { injectPaginationRootContext } from './pagination-context.token';
import { computed, Directive } from '@angular/core';

// as Button
@Directive({
    selector: '[rdxPaginationPrev]',
    host: {
        '[attr.aria-label]': '"Previous Page"',

        '[attr.disabled]': 'disabled() ? "" : undefined',
        '(click)': 'onClick()'
    }
})
export class RdxPaginationPrevDirective {
    private readonly rootContext = injectPaginationRootContext();

    readonly disabled = computed(() => this.rootContext.page() === 1 || this.rootContext.disabled());

    onClick() {
        if (!this.disabled()) {
            this.rootContext.onPageChange(this.rootContext.page() - 1);
        }
    }
}
