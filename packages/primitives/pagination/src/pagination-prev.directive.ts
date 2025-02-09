import { computed, Directive } from '@angular/core';
import { injectPaginationRootContext } from './pagination-context.token';

// as Button
@Directive({
    selector: '[rdxPaginationPrev]',
    host: {
        '[attr.aria-label]': '"Previous Page"',

        '[disabled]': 'disabled()',
        '(click)': 'onClick()'
    }
})
export class RdxPaginationPrevDirective {
    private readonly rootContext = injectPaginationRootContext();

    readonly disabled = computed((): boolean => this.rootContext.page() === 1 || this.rootContext.disabled());

    onClick() {
        if (!this.disabled()) {
            this.rootContext.onPageChange(this.rootContext.page() - 1);
        }
    }
}
