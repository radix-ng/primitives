import { Directive, ElementRef, inject, Input, Renderer2 } from '@angular/core';

@Directive({
    selector: '[rdxAlertDialogContent]',
    standalone: true,
    host: {
        '[attr.data-state]': 'open'
    }
})
export class AlertDialogContentDirective {
    private readonly renderer = inject(Renderer2);
    private readonly elementRef = inject(ElementRef);

    @Input() set maxWidth(value: string) {
        this.renderer.setStyle(this.elementRef.nativeElement, 'maxWidth', value);
    }
}
