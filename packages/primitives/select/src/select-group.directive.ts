import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxSelectGroup]',
    standalone: true,
    exportAs: 'rdxSelectGroup'
})
export class RdxSelectGroupDirective {}
