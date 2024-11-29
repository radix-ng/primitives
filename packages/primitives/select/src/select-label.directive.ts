import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxSelectLabel]',
    standalone: true,
    exportAs: 'rdxSelectLabel'
})
export class RdxSelectLabelDirective {}
