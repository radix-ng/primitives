import { computed, Directive, ElementRef, inject, input } from '@angular/core';

let idIterator = 0;

/**
 * @group Components
 */
@Directive({
    selector: 'label[rdxLabel]',
    exportAs: 'rdxLabel',
    host: {
        '[attr.id]': 'elementId()',
        '[attr.for]': 'htmlFor() ? htmlFor() : undefined',
        '(mousedown)': 'onMouseDown($event)'
    }
})
export class RdxLabelDirective {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    /**
     * @default 'rdx-label-{idIterator}'
     */
    readonly id = input<string>(`rdx-label-${idIterator++}`);

    /**
     * The id of the element the label is associated with.
     * @group Props
     * @defaultValue false
     */
    readonly htmlFor = input<string>();

    protected readonly elementId = computed(() => (this.id() ? this.id() : null));

    // prevent text selection when double-clicking label
    // The main problem with double-clicks in a web app is that
    // you will have to create special code to handle this on touch enabled devices.
    /**
     * @ignore
     */
    onMouseDown(event: MouseEvent): void {
        const target = event.target as HTMLElement;

        // only prevent text selection if clicking inside the label itself
        if (['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
            return;
        }

        // prevent text selection when double-clicking label
        if (this.elementRef.nativeElement.contains(target) && !event.defaultPrevented && event.detail > 1) {
            event.preventDefault();
        }
    }
}
