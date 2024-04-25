import { Directive, ElementRef, HostListener, Input, Optional, signal } from '@angular/core';

// Increasing integer for generating unique ids.
let nextUniqueId = 0;

@Directive({
    selector: 'label[rdxLabel]',
    standalone: true,
    host: {
        '[id]': '_id()',
        '[attr.for]': 'htmlFor ? htmlFor : null'
    }
})
export class RdxLabelDirective {
    /** The HTML id attribute applied to this element. */
    protected readonly _id = signal(`rdx-label-${nextUniqueId++}`);

    /**
     * The id of the element the label is associated with.
     * @default '-'
     */
    @Input() htmlFor = '';

    /** The HTML id of the Label. */
    @Input()
    set id(id: string) {
        this._id.set(id || this._id());
    }

    get id() {
        return this._id();
    }

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
