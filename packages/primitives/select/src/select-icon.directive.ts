import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxSelectIcon]',
    standalone: true,
    exportAs: 'rdxSelectIcon',
    host: {
        '[attr.aria-hidden]': 'true'
    }
})
export class RdxSelectIconDirective {}
