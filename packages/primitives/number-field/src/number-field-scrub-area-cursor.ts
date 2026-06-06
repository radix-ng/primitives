import { computed, Directive, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { RdxPortal } from '@radix-ng/primitives/portal';
import { injectNumberFieldScrubAreaContext } from './number-field-scrub-area-context';

function isWebKitBrowser(): boolean {
    return (
        typeof navigator !== 'undefined' &&
        /AppleWebKit/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent)
    );
}

/**
 * A custom element shown instead of the native cursor while scrubbing. It is portaled to the
 * document body and positioned with the Pointer Lock API. Hidden in Safari (which would shift
 * layout with the native pointer-lock notification) and for touch input.
 *
 * @see https://base-ui.com/react/components/number-field
 */
@Directive({
    selector: '[rdxNumberFieldScrubAreaCursor]',
    exportAs: 'rdxNumberFieldScrubAreaCursor',
    hostDirectives: [RdxPortal],
    host: {
        role: 'presentation',
        '[style.position]': '"fixed"',
        '[style.top.px]': '0',
        '[style.left.px]': '0',
        '[style.pointer-events]': '"none"',
        '[style.opacity]': 'shouldRender() ? "1" : "0"'
    }
})
export class RdxNumberFieldScrubAreaCursor implements OnInit, OnDestroy {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly scrubContext = injectNumberFieldScrubAreaContext()!;

    protected readonly shouldRender = computed(
        () =>
            this.scrubContext.isScrubbing() &&
            !isWebKitBrowser() &&
            !this.scrubContext.isTouchInput() &&
            !this.scrubContext.isPointerLockDenied()
    );

    ngOnInit(): void {
        this.scrubContext.registerCursor(this.elementRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.scrubContext.registerCursor(null);
    }
}
