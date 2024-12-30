import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { computed, Directive, ElementRef, forwardRef, inject } from '@angular/core';
import { injectDocument } from '@radix-ng/primitives/core';
import { RdxTooltipAnchorToken } from './hover-card-anchor.token';
import { RdxTooltipRootDirective } from './hover-card-root.directive';
import { injectTooltipRoot } from './hover-card-root.inject';

@Directive({
    selector: '[rdxTooltipAnchor]',
    exportAs: 'rdxTooltipAnchor',
    hostDirectives: [CdkOverlayOrigin],
    host: {
        type: 'button',
        '[attr.id]': 'name()',
        '[attr.aria-haspopup]': '"dialog"',
        '(click)': 'click()'
    },
    providers: [
        {
            provide: RdxTooltipAnchorToken,
            useExisting: forwardRef(() => RdxTooltipAnchorDirective)
        }
    ]
})
export class RdxTooltipAnchorDirective {
    /**
     * @ignore
     * If outside the rootDirective then null, otherwise the rootDirective directive - with optional `true` passed in as the first param.
     * If outside the rootDirective and non-null value that means the html structure is wrong - tooltip inside tooltip.
     * */
    protected rootDirective = injectTooltipRoot(true);
    /** @ignore */
    readonly elementRef = inject(ElementRef);
    /** @ignore */
    readonly overlayOrigin = inject(CdkOverlayOrigin);
    /** @ignore */
    readonly document = injectDocument();

    /** @ignore */
    readonly name = computed(() => `rdx-tooltip-external-anchor-${this.rootDirective?.uniqueId()}`);

    /** @ignore */
    click(): void {
        this.emitOutsideClick();
    }

    /** @ignore */
    setRoot(root: RdxTooltipRootDirective) {
        this.rootDirective = root;
    }

    private emitOutsideClick() {
        if (!this.rootDirective?.isOpen() || this.rootDirective?.contentDirective().onOverlayOutsideClickDisabled()) {
            return;
        }
        const clickEvent = new MouseEvent('click', {
            view: this.document.defaultView,
            bubbles: true,
            cancelable: true,
            relatedTarget: this.elementRef.nativeElement
        });
        this.rootDirective?.triggerDirective().elementRef.nativeElement.dispatchEvent(clickEvent);
    }
}
