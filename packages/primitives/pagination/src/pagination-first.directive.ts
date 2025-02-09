import { computed, Directive } from '@angular/core';
import { injectPaginationRootContext } from './pagination-context.token';

// as Button
@Directive({
    selector: '[rdxPaginationFirst]',
    host: {
        '[attr.aria-label]': '"First Page"',

        '[disabled]': 'disabled()',
        '(click)': 'onClick()'
    }
})
export class RdxPaginationFirstDirective {
    private readonly rootContext = injectPaginationRootContext();

    readonly disabled = computed(() => this.rootContext.page() === 1 || this.rootContext.disabled());

    onClick() {
        if (!this.disabled()) {
            this.rootContext.onPageChange(1);
        }
    }
}
