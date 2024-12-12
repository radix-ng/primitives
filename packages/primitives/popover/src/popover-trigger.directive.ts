import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { computed, Directive, ElementRef, inject } from '@angular/core';
import { injectPopoverRoot } from './popover-root.inject';

@Directive({
    selector: '[rdxPopoverTrigger]',
    standalone: true,
    hostDirectives: [CdkOverlayOrigin],
    host: {
        type: 'button',
        '[attr.id]': 'name()',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.aria-expanded]': 'popoverRoot.isOpen()',
        '[attr.aria-controls]': 'controlsId()',
        '[attr.data-state]': 'popoverRoot.state()',
        '(click)': 'onClick()'
    }
})
export class RdxPopoverTriggerDirective {
    /** @ignore */
    readonly popoverRoot = injectPopoverRoot();
    /** @ignore */
    readonly elementRef = inject(ElementRef);
    /** @ignore */
    readonly overlayOrigin = inject(CdkOverlayOrigin);

    /** @ignore */
    readonly name = computed(() => `rdx-popover-trigger-${this.popoverRoot.uniqueId()}`);
    /** @ignore */
    readonly controlsId = computed(() => `rdx-popover-trigger-controls-${this.popoverRoot.uniqueId()}`);

    /** @ignore */
    onClick(): void {
        this.popoverRoot.handleToggle();
    }
}
