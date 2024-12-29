import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { computed, Directive, ElementRef, inject } from '@angular/core';
import { injectTooltipRoot } from './tooltip-root.inject';

@Directive({
    selector: '[rdxTooltipTrigger]',
    hostDirectives: [CdkOverlayOrigin],
    host: {
        type: 'button',
        '[attr.id]': 'name()',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.aria-expanded]': 'rootDirective.isOpen()',
        '[attr.aria-controls]': 'rootDirective.contentDirective().name()',
        '[attr.data-state]': 'rootDirective.state()',
        '(click)': 'click()'
    }
})
export class RdxTooltipTriggerDirective {
    /** @ignore */
    protected readonly rootDirective = injectTooltipRoot();
    /** @ignore */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    /** @ignore */
    readonly overlayOrigin = inject(CdkOverlayOrigin);

    /** @ignore */
    readonly name = computed(() => `rdx-tooltip-trigger-${this.rootDirective.uniqueId()}`);

    /** @ignore */
    click(): void {
        this.rootDirective.handleToggle();
    }
}
