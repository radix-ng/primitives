import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { computed, Directive, ElementRef, inject } from '@angular/core';
import { injectHoverCardRoot } from './hover-card-root.inject';

@Directive({
    selector: '[rdxHoverCardTrigger]',
    hostDirectives: [CdkOverlayOrigin],
    host: {
        '[attr.id]': 'name()',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.aria-expanded]': 'rootDirective.isOpen()',
        '[attr.aria-controls]': 'rootDirective.contentDirective().name()',
        '[attr.data-state]': 'rootDirective.state()',
        '(pointerenter)': 'pointerenter()',
        '(pointerleave)': 'pointerleave()',
        '(focus)': 'focus()',
        '(blur)': 'blur()',
        '(click)': 'click()'
    }
})
export class RdxHoverCardTriggerDirective {
    /** @ignore */
    protected readonly rootDirective = injectHoverCardRoot();
    /** @ignore */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    /** @ignore */
    readonly overlayOrigin = inject(CdkOverlayOrigin);

    /** @ignore */
    readonly name = computed(() => `rdx-hover-card-trigger-${this.rootDirective.uniqueId()}`);

    /** @ignore */
    protected pointerenter(): void {
        this.rootDirective.handleOpen();
    }

    /** @ignore */
    protected pointerleave(): void {
        this.rootDirective.handleClose();
    }

    /** @ignore */
    protected focus(): void {
        this.rootDirective.handleOpen();
    }

    /** @ignore */
    protected blur(): void {
        this.rootDirective.handleClose();
    }

    /** @ignore */
    protected click(): void {
        this.rootDirective.handleClose();
    }
}
