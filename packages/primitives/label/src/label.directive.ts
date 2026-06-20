import { Directive, ElementRef, inject, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';

/**
 * @group Components
 */
@Directive({
    selector: 'label[rdxLabel]',
    exportAs: 'rdxLabel',
    host: {
        '[attr.id]': 'id()',
        '[attr.for]': 'htmlFor() ? htmlFor() : undefined',
        '(mousedown)': 'onMouseDown($event)'
    }
})
export class RdxLabelDirective {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    /**
     * The label id. Defaults to a stable generated id.
     * @group Props
     */
    readonly id = input<string>(injectId('rdx-label-'));

    /**
     * The id of the element the label is associated with.
     * @group Props
     * @default undefined
     */
    readonly htmlFor = input<string>();

    // prevent text selection when double-clicking label
    // The main problem with double-clicks in a web app is that
    // you will have to create special code to handle this on touch enabled devices.
    /**
     * @ignore
     */
    onMouseDown(event: MouseEvent): void {
        const target = event.target as HTMLElement;

        // only prevent text selection if not clicking inside an interactive control (or its
        // descendants), so clicks still focus/activate the associated control.
        if (target.closest('button, input, select, textarea')) {
            return;
        }

        // prevent text selection when double-clicking label
        if (this.elementRef.nativeElement.contains(target) && !event.defaultPrevented && event.detail > 1) {
            event.preventDefault();
        }
    }
}
