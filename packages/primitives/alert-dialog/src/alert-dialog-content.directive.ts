import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Directive, ElementRef, inject, Input, Renderer2 } from '@angular/core';

@Directive({
    selector: '[rdxAlertDialogContent]',
    standalone: true,
    hostDirectives: [
        {
            directive: CdkTrapFocus
        }
    ],
    host: {
        '[attr.data-state]': '"open"',
        '[attr.cdkTrapFocusAutoCapture]': 'true'
    }
})
export class RdxAlertDialogContentDirective {
    private readonly renderer = inject(Renderer2);
    private readonly elementRef = inject(ElementRef);

    @Input() set maxWidth(value: string) {
        this.renderer.setStyle(this.elementRef.nativeElement, 'maxWidth', value);
    }
}
