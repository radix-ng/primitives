import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    forwardRef,
    input,
    model,
    numberAttribute,
    output
} from '@angular/core';
import { PAGINATION_ROOT_CONTEXT } from './pagination-context.token';

@Directive({
    selector: '[rdxPaginationRoot]',
    exportAs: 'rdxPaginationRoot',
    providers: [{ provide: PAGINATION_ROOT_CONTEXT, useExisting: forwardRef(() => RdxPaginationRootDirective) }]
})
export class RdxPaginationRootDirective {
    readonly defaultPage = input<number, NumberInput>(1, { transform: numberAttribute });

    readonly page = model<number>(this.defaultPage());

    readonly itemsPerPage = input<number, NumberInput>(undefined, { transform: numberAttribute });

    readonly total = input<number, NumberInput>(0, { transform: numberAttribute });

    readonly siblingCount = input<number, NumberInput>(2, { transform: numberAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly showEdges = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly updatePage = output<number>();

    /** @ignore */
    readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / (this.itemsPerPage() || 1))));

    /** @ignore */
    onPageChange(value: number) {
        if (!this.disabled()) {
            this.page.set(value);
            this.updatePage.emit(value);
        }
    }
}
