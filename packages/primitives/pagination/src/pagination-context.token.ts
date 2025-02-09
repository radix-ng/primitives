import { computed, inject, InjectionToken, model } from '@angular/core';

export interface PaginationRootContext {
    page: ReturnType<typeof model<number>>;
    onPageChange: (value: number) => void;
    pageCount: ReturnType<typeof computed<number>>;
    siblingCount: ReturnType<typeof computed<number>>;
    disabled: ReturnType<typeof computed<boolean>>;
    showEdges: ReturnType<typeof computed<boolean>>;
}

export const PAGINATION_ROOT_CONTEXT = new InjectionToken<PaginationRootContext>('PaginationRootContext');

export function injectPaginationRootContext(): PaginationRootContext {
    return inject(PAGINATION_ROOT_CONTEXT);
}
