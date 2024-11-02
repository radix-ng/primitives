import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxSelectContent]',
    standalone: true,
    exportAs: 'rdxSelectContent',
    host: {
        '[attr.data-state]': 'true',
        '[attr.data-side]': 'true',
        '[attr.data-align]': 'true'
    }
})
export class RdxSelectContentDirective {}
