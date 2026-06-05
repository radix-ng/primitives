import { afterRenderEffect, Directive, ElementRef, inject, signal } from '@angular/core';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

@Directive({
    selector: '[rdxCollapsibleContent]',
    host: {
        '[id]': 'rootContext.contentId()',
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-disabled]': 'rootContext.disabled() ? "true" : undefined',
        '[attr.hidden]': '!rootContext.keepMounted() && shouldHide() ? "until-found" : undefined',
        '[style.--radix-collapsible-content-width.px]': 'width()',
        '[style.--radix-collapsible-content-height.px]': 'height()',
        '(animationend)': 'onExitComplete($event)',
        '(transitionend)': 'onExitComplete($event)'
    }
})
export class RdxCollapsibleContentDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly rootContext = injectCollapsibleRootContext()!;

    readonly height = signal<number | null>(null);
    readonly width = signal<number | null>(null);
    readonly shouldHide = signal(true);

    /**
     * The first measurement (the initial mount) must not re-enable animations, so an element that
     * mounts already open renders at its final size without playing the open animation.
     */
    private isFirstMeasure = true;
    private originalStyles?: { transitionDuration: string; animationName: string };

    constructor() {
        // `afterRenderEffect` runs after the DOM is committed (but before paint) with the settled
        // `open` state — no `requestAnimationFrame` race — and is a no-op during SSR.
        afterRenderEffect(() => {
            const isOpen = this.rootContext.open();
            this.updateDimensions(isOpen);
        });
    }

    /**
     * Hide the content once its close animation/transition finishes. Handles both `@keyframes`
     * (animationend) and CSS `transition` (transitionend) exits. Ignores events bubbling from
     * descendants.
     */
    onExitComplete(event: Event): void {
        if (event.target !== this.elementRef.nativeElement) {
            return;
        }

        if (!this.rootContext.open()) {
            this.shouldHide.set(true);
        }
    }

    private updateDimensions(isOpen: boolean): void {
        const node = this.elementRef.nativeElement;
        if (!node) return;

        this.originalStyles ??= {
            transitionDuration: node.style.transitionDuration,
            animationName: node.style.animationName
        };

        if (isOpen) {
            this.shouldHide.set(false);
            node.hidden = false;
        }

        // Block any animation/transition so we can measure the element at its natural size.
        node.style.transitionDuration = '0s';
        node.style.animationName = 'none';

        const rect = node.getBoundingClientRect();
        this.height.set(rect.height);
        this.width.set(rect.width);

        // Re-enable the original animation, unless this is the very first (mount) measurement.
        if (!this.isFirstMeasure) {
            node.style.transitionDuration = this.originalStyles.transitionDuration;
            node.style.animationName = this.originalStyles.animationName;
        }

        this.isFirstMeasure = false;
    }
}
