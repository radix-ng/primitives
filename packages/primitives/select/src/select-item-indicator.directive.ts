import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxSelectItemIndicator]',
    standalone: true,
    exportAs: 'rdxSelectItemIndicator',
    host: {
        '[attr.aria-hidden]': 'true'
    }
})
export class RdxSelectItemIndicatorDirective {}
