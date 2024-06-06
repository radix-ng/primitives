import { Directive, ElementRef, EventEmitter, inject, Output } from '@angular/core';

@Directive({
    selector: '[rdxCollapse]',
    exportAs: 'rdxCollapse',
    standalone: true
})
export class RdxCollapse {
    #elementRef = inject(ElementRef);

    @Output() collapseChange = new EventEmitter<boolean>();
}
