import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { computed, Directive, ElementRef, forwardRef, inject } from '@angular/core';
import { injectDocument } from '@radix-ng/primitives/core';
import { RdxHoverCardAnchorToken } from './hover-card-anchor.token';
import { RdxHoverCardRootDirective } from './hover-card-root.directive';
import { injectHoverCardRoot } from './hover-card-root.inject';

@Directive({
    selector: '[rdxHoverCardAnchor]',
    exportAs: 'rdxHoverCardAnchor',
    hostDirectives: [CdkOverlayOrigin],
    host: {
        type: 'button',
        '[attr.id]': 'name()',
        '[attr.aria-haspopup]': '"dialog"',
        '(click)': 'click()'
    },
    providers: [
        {
            provide: RdxHoverCardAnchorToken,
            useExisting: forwardRef(() => RdxHoverCardAnchorDirective)
        }
    ]
})
export class RdxHoverCardAnchorDirective {
    /**
     * @ignore
     * If outside the rootDirective then null, otherwise the rootDirective directive - with optional `true` passed in as the first param.
     * If outside the rootDirective and non-null value that means the html structure is wrong - hover-card inside hover-card.
     * */
    protected rootDirective = injectHoverCardRoot(true);
    /** @ignore */
    readonly elementRef = inject(ElementRef);
    /** @ignore */
    readonly overlayOrigin = inject(CdkOverlayOrigin);
    /** @ignore */
    readonly document = injectDocument();

    /** @ignore */
    readonly name = computed(() => `rdx-hover-card-external-anchor-${this.rootDirective?.uniqueId()}`);

    /** @ignore */
    click(): void {
        this.emitOutsideClick();
    }

    /** @ignore */
    setRoot(root: RdxHoverCardRootDirective) {
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
