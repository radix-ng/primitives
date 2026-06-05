import { booleanAttribute, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { injectRdxDialogRootContext } from './dialog-root';

/**
 * A button that opens the dialog.
 */
@Directive({
    selector: 'button[rdxDialogTrigger]',
    exportAs: 'rdxDialogTrigger',
    host: {
        type: 'button',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.aria-controls]': 'rootContext.contentId',
        '[attr.aria-expanded]': 'rootContext.isOpen()',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-popup-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.disabled]': 'disabled() ? "" : undefined',
        '(click)': 'handleClick($event)'
    }
})
export class RdxDialogTrigger {
    protected readonly rootContext = injectRdxDialogRootContext()!;
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Whether the trigger should ignore user interaction.
     */
    readonly disabled = input(false, { transform: booleanAttribute });

    constructor() {
        // Register the trigger so the popup can keep it from double-dismissing:
        // a pointerdown on the trigger reaches the dismissable layer as an outside press,
        // which would close the dialog right before this trigger's own click reopens it.
        this.rootContext.setTriggerElement(this.elementRef.nativeElement);
        inject(DestroyRef).onDestroy(() => this.rootContext.setTriggerElement(undefined));
    }

    protected handleClick(event: MouseEvent) {
        if (this.disabled()) {
            return;
        }

        this.rootContext.toggle(event);
    }
}
