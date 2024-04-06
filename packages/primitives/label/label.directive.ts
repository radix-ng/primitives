import {
    AfterContentInit,
    ContentChild,
    Directive,
    ElementRef,
    HostListener,
    Optional
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

interface ControlValueAccessorWithElement extends ControlValueAccessor {
    el?: ElementRef;
}

@Directive({
    selector: 'label[kbqLabel]',
    standalone: true
})
export class LabelDirective implements AfterContentInit {
    @ContentChild(NgControl) control: NgControl | undefined;

    constructor(@Optional() private el: ElementRef) {}

    ngAfterContentInit(): void {
        const accessor: ControlValueAccessorWithElement = this.control
            ?.valueAccessor as ControlValueAccessorWithElement;

        if (accessor && accessor.el && this.el.nativeElement) {
            const inputElement: HTMLElement = accessor.el.nativeElement;
            if (inputElement.id) {
                this.el.nativeElement.setAttribute('for', inputElement.id);
            }
        }
    }

    // prevent text selection when double-clicking label
    // The main problem with double clicks in a web app is that
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
