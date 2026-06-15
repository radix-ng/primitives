import { booleanAttribute, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { BooleanInput, RDX_FLOATING_ROOT_CONTEXT } from '@radix-ng/primitives/core';
import { injectRdxDialogRootContext } from './dialog-root';

/**
 * An overlay displayed beneath the dialog popup.
 *
 * Decorative-only, so it carries `role="presentation"` (Base UI `DialogBackdrop`). By default a **nested**
 * dialog renders no backdrop — the parent's already dims the page; stacking a second one double-darkens
 * and intercepts the parent's outside-press. Set `forceRender` to opt back in.
 */
@Directive({
    selector: '[rdxDialogBackdrop]',
    exportAs: 'rdxDialogBackdrop',
    host: {
        role: 'presentation',
        '[hidden]': 'rootContext.nested && !forceRender()',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-nested]': 'rootContext.nested ? "" : undefined',
        '[attr.data-nested-dialog-open]': 'rootContext.nestedDialogOpen() ? "" : undefined'
    }
})
export class RdxDialogBackdrop {
    protected readonly rootContext = injectRdxDialogRootContext();

    /** Render the backdrop even for a nested dialog (off by default, matching Base UI). */
    readonly forceRender = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    constructor() {
        // The backdrop is a second portal root (a body sibling of the popup). Register it as an owned
        // floating element so the focus manager's `markOthers` keeps it — otherwise it would be wrongly
        // aria-hidden / marked as outside content (ADR 0017 §3).
        const floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT, { optional: true });
        if (floatingContext) {
            const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
            floatingContext.addFloatingElement(host);
            inject(DestroyRef).onDestroy(() => floatingContext.removeFloatingElement(host));
        }
    }
}
