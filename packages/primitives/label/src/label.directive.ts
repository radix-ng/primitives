import { computed, Directive, ElementRef, HostAttributeToken, inject, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';

/**
 * @group Components
 */
@Directive({
    selector: 'label[rdxLabel]',
    exportAs: 'rdxLabel',
    host: {
        '[attr.id]': 'id()',
        '[attr.for]': 'controlId()',
        '(mousedown)': 'onMouseDown($event)'
    }
})
export class RdxLabelDirective {
    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly authoredFor = inject(new HostAttributeToken('for'), { optional: true });

    /**
     * The label id. Defaults to a stable generated id.
     * @group Props
     */
    readonly id = input<string>(injectId('rdx-label-'));

    /**
     * The id of the associated control. A defined value overrides the native `for` attribute.
     * @group Props
     * @default undefined
     */
    readonly htmlFor = input<string>();

    protected readonly controlId = computed(() => {
        const htmlFor = this.htmlFor();
        return htmlFor === undefined ? this.authoredFor : htmlFor || null;
    });

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
