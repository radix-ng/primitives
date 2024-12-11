import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { computed, Directive, ElementRef, inject, input } from '@angular/core';
import { injectPopoverRoot } from './popover-root.inject';

let nextId = 0;

@Directive({
    selector: '[rdxPopoverTrigger]',
    standalone: true,
    hostDirectives: [CdkOverlayOrigin],
    host: {
        type: 'button',
        '[attr.id]': 'id()',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.aria-expanded]': 'popoverRoot.isOpen()',
        '[attr.aria-controls]': 'popoverId()',
        '[attr.data-state]': 'popoverRoot.state()',
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
    readonly overlayOrigin = inject(CdkOverlayOrigin);

    /** @ignore */
    onClick(): void {
        this.popoverRoot.handleToggle();
    }
}
