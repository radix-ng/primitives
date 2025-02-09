import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxPaginationEllipsis]',
    host: {
        '[attr.data-type]': '"ellipsis"'
    }
})
export class RdxPaginationEllipsisDirective {}
