import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { computed, Directive, ElementRef, inject } from '@angular/core';
import { injectPopoverRoot } from './popover-root.inject';

@Directive({
    selector: '[rdxPopoverTrigger]',
    hostDirectives: [CdkOverlayOrigin],
    host: {
        type: 'button',
        '[attr.id]': 'name()',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.aria-expanded]': 'popoverRoot.isOpen()',
        '[attr.aria-controls]': 'popoverRoot.popoverContentDirective().name()',
        '[attr.data-state]': 'popoverRoot.state()',
        '(click)': 'click()'
    }
})
export class RdxPopoverTriggerDirective {
    /** @ignore */
    protected readonly popoverRoot = injectPopoverRoot();
    /** @ignore */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    /** @ignore */
    readonly overlayOrigin = inject(CdkOverlayOrigin);

    /** @ignore */
    readonly name = computed(() => `rdx-popover-trigger-${this.popoverRoot.uniqueId()}`);

    /** @ignore */
    protected click(): void {
        this.popoverRoot.handleToggle();
    }
}
