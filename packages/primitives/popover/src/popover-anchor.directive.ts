import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { computed, Directive, ElementRef, forwardRef, inject, signal } from '@angular/core';
import { RdxPopoverAnchorToken } from './popover-anchor.token';
import { RdxPopoverRootDirective } from './popover-root.directive';
import { injectPopoverRoot } from './popover-root.inject';

@Directive({
    selector: '[rdxPopoverAnchor]',
    standalone: true,
    exportAs: 'rdxPopoverAnchor',
    hostDirectives: [CdkOverlayOrigin],
    host: {
        type: 'button',
        '[attr.id]': 'name()',
        '[attr.aria-haspopup]': '"dialog"',
        '(click)': 'click()'
    },
    providers: [
        {
            provide: RdxPopoverAnchorToken,
            useExisting: forwardRef(() => RdxPopoverAnchorDirective)
        }
    ]
})
export class RdxPopoverAnchorDirective {
    /** @ignore */
    protected readonly popoverRoot = signal(injectPopoverRoot(true));
    /** @ignore */
    readonly elementRef = inject(ElementRef);
    /** @ignore */
    readonly overlayOrigin = inject(CdkOverlayOrigin);

    /** @ignore */
    readonly name = computed(() => `rdx-popover-external-anchor-${this.popoverRoot()?.uniqueId()}`);

    /** @ignore */
    click(): void {
        this.emitOutsideClick();
    }

    /** @ignore */
    setPopoverRoot(popoverRoot: RdxPopoverRootDirective) {
        this.popoverRoot.set(popoverRoot);
    }

    private emitOutsideClick() {
        const clickEvent = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
        window.document.body.dispatchEvent(clickEvent);
    }
}
