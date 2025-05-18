import { afterNextRender, computed, Directive, effect, ElementRef, inject, signal } from '@angular/core';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

@Directive({
    selector: '[rdxCollapsibleContent]',
    host: {
        '[id]': 'rootContext.contentId()',
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-disabled]': 'rootContext.disabled() ? "true" : undefined',
        '[attr.hidden]': 'shouldHide() ? "until-found" : undefined',
        '[style.--radix-collapsible-content-width.px]': 'width()',
        '[style.--radix-collapsible-content-height.px]': 'height()',
        '(animationend)': 'onAnimationEnd()'
    }
})
export class RdxCollapsibleContentDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly rootContext = injectCollapsibleRootContext()!;

    readonly isOpen = computed(() => this.rootContext.open());

    readonly height = signal<number | null>(null);
    readonly width = signal<number | null>(null);
    readonly shouldHide = signal(true);
    private isMountAnimationPrevented = signal(true);
    private currentStyle = signal<{ transitionDuration: string; animationName: string } | null>(null);

    private firstRender = true;

    constructor() {
        effect(() => {
            const isOpen = this.isOpen();

            requestAnimationFrame(() => {
                this.updateDimensions(isOpen);
            });
        });

        afterNextRender(() => {
            requestAnimationFrame(() => {
                this.isMountAnimationPrevented.set(false);
            });
        });
    }

    onAnimationEnd() {
        if (!this.isOpen()) {
            this.shouldHide.set(true);
        }
    }

    private async updateDimensions(isOpen: boolean) {
        const node = this.elementRef.nativeElement;
        if (!node) return;

        if (!this.currentStyle()) {
            this.currentStyle.set({
                transitionDuration: node.style.transitionDuration,
                animationName: node.style.animationName
            });
        }

        if (isOpen) {
            this.shouldHide.set(false);
            node.hidden = false;
        }

        node.style.transitionDuration = '0s';
        node.style.animationName = 'none';

        const rect = node.getBoundingClientRect();
        this.height.set(rect.height);
        this.width.set(rect.width);

        if (!this.isMountAnimationPrevented() && !this.firstRender) {
            node.style.transitionDuration = this.currentStyle()?.transitionDuration || '';
            node.style.animationName = this.currentStyle()?.animationName || '';
        }

        this.firstRender = false;
    }
}
