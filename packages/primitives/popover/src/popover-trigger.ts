import { booleanAttribute, computed, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * A button that opens the popover.
 */
@Directive({
    selector: 'button[rdxPopoverTrigger]',
    hostDirectives: [RdxPopperAnchor],
    host: {
        type: 'button',
        '[attr.aria-controls]': 'rootContext.contentId',
        '[attr.aria-expanded]': 'rootContext.isOpen()',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-popup-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.disabled]': 'disabled() ? "" : undefined',
        '(click)': 'handleClick()',
        '(pointerdown)': 'handlePointerDown()',
        '(pointerup)': 'handlePointerUp()'
    }
})
export class RdxPopoverTrigger {
    protected readonly rootContext = injectRdxPopoverRootContext()!;
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Whether the trigger should ignore user interaction.
     */
    readonly disabled = input(false, { transform: booleanAttribute });

    protected readonly isOpen = computed(() => this.rootContext.isOpen());

    constructor() {
        this.rootContext.setTrigger(this.elementRef.nativeElement);
        inject(DestroyRef).onDestroy(() => {
            if (this.rootContext.trigger() === this.elementRef.nativeElement) {
                this.rootContext.setTrigger(undefined);
            }
        });
    }

    protected handleClick() {
        if (this.disabled()) {
            return;
        }

        this.rootContext.setPointerDownOnTrigger(false);
        this.rootContext.toggle();
    }

    protected handlePointerDown() {
        this.rootContext.setPointerDownOnTrigger(true);
    }

    protected handlePointerUp() {
        this.rootContext.setPointerDownOnTrigger(false);
    }
}
