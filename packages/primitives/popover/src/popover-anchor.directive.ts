import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { computed, Directive, ElementRef, forwardRef, inject } from '@angular/core';
import { injectDocument } from '@radix-ng/primitives/core';
import { RdxPopoverAnchorToken } from './popover-anchor.token';
import { RdxPopoverRootDirective } from './popover-root.directive';
import { injectPopoverRoot } from './popover-root.inject';

@Directive({
    selector: '[rdxPopoverAnchor]',
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
    /**
     * @ignore
     * If outside the root then null, otherwise the root directive - with optional `true` passed in as the first param.
     * If outside the root and non-null value that means the html structure is wrong - popover inside popover.
     * */
    protected popoverRoot = injectPopoverRoot(true);
    /** @ignore */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    /** @ignore */
    readonly overlayOrigin = inject(CdkOverlayOrigin);
    /** @ignore */
    readonly document = injectDocument();

    /** @ignore */
    readonly name = computed(() => `rdx-popover-external-anchor-${this.popoverRoot?.uniqueId()}`);

    /** @ignore */
    click(): void {
        this.emitOutsideClick();
    }

    /** @ignore */
    setPopoverRoot(popoverRoot: RdxPopoverRootDirective) {
        this.popoverRoot = popoverRoot;
    }

    private emitOutsideClick() {
        if (
            !this.popoverRoot?.isOpen() ||
            this.popoverRoot?.popoverContentDirective().onOverlayOutsideClickDisabled()
        ) {
            return;
        }
        const clickEvent = new MouseEvent('click', {
            view: this.document.defaultView,
            bubbles: true,
            cancelable: true,
            relatedTarget: this.elementRef.nativeElement
        });
        this.popoverRoot?.popoverTriggerDirective().elementRef.nativeElement.dispatchEvent(clickEvent);
    }
}
