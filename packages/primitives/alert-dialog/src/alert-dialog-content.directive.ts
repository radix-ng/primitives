import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
    selector: '[rdxAlertDialogContent]',
    standalone: true,
    host: {
        '[attr.data-state]': 'open'
    }
})
export class AlertDialogContentDirective {
    @Input('appAlertDialogContent') set maxWidth(value: string) {
        this.renderer.setStyle(this.el.nativeElement, 'maxWidth', value);
    }

    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) {}
}
