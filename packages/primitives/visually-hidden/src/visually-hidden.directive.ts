import { Directive, ElementRef, inject, OnInit } from '@angular/core';

@Directive({
    selector: '[rdxVisuallyHidden]',
    standalone: true
})
export class VisuallyHiddenDirective implements OnInit {
    /**
     * Access the element.
     */
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

    ngOnInit(): void {
        // hide the element
        Object.assign(this.element.nativeElement.style, {
            position: 'absolute',
            border: 0,
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            wordWrap: 'normal',
            // Avoid browsers rendering the focus ring in some cases.
            outline: 'none',
            appearance: 'none',
            // Avoid some cases where the browser will still render the native controls
            '-webkit-appearance': 'none',
            '-moz-appearance': 'none',
            left: 0
        });
    }
}
