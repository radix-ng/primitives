import { Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
    selector: 'label[LabelRoot]',
    exportAs: 'LabelRoot',
    standalone: true,
    host: {
        '[attr.for]': 'htmlFor ? htmlFor : null',
        '(mousedown)': 'onMouseDown($event)'
    }
})
export class RdxLabelRootDirective {
    /**
     * The id of the element the label is associated with.
     * @default '-'
     */
    readonly htmlFor = input<string>('');

    private readonly elementRef = inject(ElementRef<HTMLElement>);

    // prevent text selection when double-clicking label
    // The main problem with double-clicks in a web app is that
    // you will have to create special code to handle this on touch enabled devices.
    onMouseDown(event: MouseEvent): void {
        const target = event.target as HTMLElement;

        // only prevent text selection if clicking inside the label itself
        if (['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
            return;
        }

        // prevent text selection when double-clicking label
        if (
            this.elementRef.nativeElement.contains(target) &&
            !event.defaultPrevented &&
            event.detail > 1
        ) {
            event.preventDefault();
        }
    }
}
