import { computed, Directive } from '@angular/core';
import { injectPaginationRootContext } from './pagination-context.token';

// as Button
@Directive({
    selector: '[rdxPaginationLast]',
    host: {
        '[attr.aria-label]': '"Last Page"',

        '[disabled]': 'disabled()',
        '(click)': 'onClick()'
    }
})
export class RdxPaginationLastDirective {
    private readonly rootContext = injectPaginationRootContext();

    readonly disabled = computed(
        () => this.rootContext.page() === this.rootContext.pageCount() || this.rootContext.disabled()
    );

    onClick() {
        if (!this.disabled()) {
            this.rootContext.onPageChange(this.rootContext.pageCount());
        }
    }
}
