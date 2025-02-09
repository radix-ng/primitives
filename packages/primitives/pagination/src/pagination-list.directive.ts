import { computed, Directive } from '@angular/core';
import { injectPaginationRootContext } from './pagination-context.token';
import { getRange, transform } from './utils';

@Directive({
    selector: '[rdxPaginationList]',
    exportAs: 'rdxPaginationList'
})
export class RdxPaginationListDirective {
    private readonly rootContext = injectPaginationRootContext();

    readonly transformedRange = computed(() => {
        return transform(
            getRange(
                this.rootContext.page(),
                this.rootContext.pageCount(),
                this.rootContext.siblingCount(),
                this.rootContext.showEdges()
            )
        );
    });
}
