import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: '[rdxSelectTrigger]',
    standalone: true,
    host: {
        '[attr.role]': '"button"',
        '[attr.data-state]': 'true',
        '[attr.data-disabled]': 'true',
        '[attr.data-placeholder]': 'true'
    }
})
export class RdxSelectTriggerDirective {
    protected nativeElement = inject(ElementRef).nativeElement;

    focus() {
        this.nativeElement.focus();
    }
}
