import { computed, Directive, ElementRef, inject, input } from '@angular/core';
import { injectPopoverRoot } from './popover-root.directive';

let nextId = 0;

@Directive({
    selector: '[rdxPopoverTrigger]',
    standalone: true,
    host: {
        type: 'button',
        '[attr.id]': 'this.id()',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.aria-expanded]': 'this.popoverRoot.isOpen()',
        '[attr.aria-controls]': 'this.popoverId()',
        '[attr.data-state]': 'this.popoverRoot.state()',
        '(click)': 'onClick()'
    }
})
export class RdxPopoverTriggerDirective {
    readonly id = input(`rdx-popover-root-${nextId++}`);
    readonly popoverId = computed(() => `rdx-popover-${this.id()}`);

    /** @ignore */
    readonly popoverRoot = injectPopoverRoot();
    /** @ignore */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef<HTMLElement>);

    /** @ignore */
    onClick(): void {
        this.popoverRoot.handleToggle();
    }
}
