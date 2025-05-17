import { afterNextRender, computed, Directive, effect, ElementRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

@Directive({
    selector: '[rdxCollapsibleContent]',
    host: {
        '[id]': 'rootContext.contentId()',
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-disabled]': 'rootContext.disabled() ? "true" : undefined',
        '[attr.hidden]': '!rootContext.open() ? "until-found" : undefined',
        '[style.--radix-collapsible-content-width.px]': 'width()',
        '[style.--radix-collapsible-content-height.px]': 'height()'
    }
})
export class RdxCollapsibleContentDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly platformId = inject(PLATFORM_ID);

    protected readonly rootContext = injectCollapsibleRootContext()!;

    readonly isOpen = computed(() => this.rootContext.open());

    readonly height = signal<number | null>(null);
    readonly width = signal<number | null>(null);

    private isMountAnimationPrevented = signal(true);

    private firstRender = true;

    private currentStyle = signal<{ transitionDuration: string; animationName: string } | null>(null);

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

    private async updateDimensions(isOpen: boolean) {
        const node = this.elementRef.nativeElement;
        if (!node) return;

        if (!this.currentStyle()) {
            this.currentStyle.set({
                transitionDuration: node.style.transitionDuration,
                animationName: node.style.animationName
            });
        }

        node.style.transitionDuration = '0s';
        node.style.animationName = 'none';

        const rect = node.getBoundingClientRect();
        this.height.set(rect.height);
        this.width.set(rect.width);
        //   await new Promise((resolve) => setTimeout(resolve));

        if (!this.isMountAnimationPrevented() && !this.firstRender) {
            node.style.transitionDuration = this.currentStyle()?.transitionDuration || '';
            node.style.animationName = this.currentStyle()?.animationName || '';
        }

        this.firstRender = false;
    }
}
