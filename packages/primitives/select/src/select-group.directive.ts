import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxSelectGroup]',
    standalone: true,
    exportAs: 'rdxSelectGroup',
    host: {
        '[attr.role]': '"group"'
    }
})
export class RdxSelectGroupDirective {}
