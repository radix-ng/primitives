import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { RDX_FLOATING_ROOT_CONTEXT } from '@radix-ng/primitives/core';

/**
 * Marks its host as **inside** the enclosing floating layer (ADR 0015): a pointer / focus interaction on
 * it does not count as "outside", so it never dismisses the popup. It registers the host into the
 * floating root context's trigger registry — {@link RdxDismiss}'s `isInside` check reads it.
 *
 * Use it for an element that lives **outside** the popup DOM but logically belongs to the layer — e.g. a
 * Combobox input / trigger / chips / clear button that keeps focus (or is clicked) while the listbox is
 * open.
 */
@Directive({
    selector: '[rdxFloatingInside]',
    exportAs: 'rdxFloatingInside'
})
export class RdxFloatingInsideElement {
    constructor() {
        const context = inject(RDX_FLOATING_ROOT_CONTEXT, { optional: true });
        if (!context) {
            return;
        }
        const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        context.triggers.add(host);
        inject(DestroyRef).onDestroy(() => context.triggers.delete(host));
    }
}
