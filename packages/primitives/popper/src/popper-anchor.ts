import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: '[rdxPopperAnchor]'
})
export class RdxPopperAnchor {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}
