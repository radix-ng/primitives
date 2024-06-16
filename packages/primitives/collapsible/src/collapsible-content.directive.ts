import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: '[CollapsibleContent]',
    standalone: true
})
export class RdxCollapsibleContentDirective /*implements OnInit*/ {
    elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}
