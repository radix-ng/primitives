import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: '[rdxFocusInitial]'
})
export class RdxFocusInitialDirective {
    /** @ignore */
    private readonly nativeElement = inject(ElementRef).nativeElement;

    /** @ignore */
    focus(): void {
        this.nativeElement.focus();
    }
}
