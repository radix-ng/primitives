import { Directive, ElementRef, HostListener, Input, Optional } from '@angular/core';

@Directive({
    selector: 'label[rdxLabel]',
    standalone: true,
    host: {
        '[attr.for]': 'htmlFor ? htmlFor : null'
    }
})
export class LabelDirective {
    @Input() htmlFor = '';

    constructor(@Optional() private el: ElementRef) {}

    // prevent text selection when double-clicking label
    // The main problem with double-clicks in a web app is that
    // you will have to create special code to handle this on touch enabled devices.
    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        const target = event.target as HTMLElement;

        // only prevent text selection if clicking inside the label itself
        if (['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
            return;
        }

        // prevent text selection when double-clicking label
        if (this.el.nativeElement.contains(target) && !event.defaultPrevented && event.detail > 1) {
            event.preventDefault();
        }
    }
}
