import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxSelectSeparator]',
    standalone: true,
    exportAs: 'rdxSelectSeparator',
    host: {
        '[attr.aria-hidden]': 'true'
    }
})
export class RdxSelectSeparatorDirective {}
