import { afterNextRender, computed, Directive, ElementRef, inject, signal } from '@angular/core';
import { watch } from '@radix-ng/primitives/core';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

@Directive({
    selector: '[rdxCollapsibleContent]',
    host: {
        id: 'rootContext.contentId()',

        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-disabled]': 'rootContext.disabled() ? "true" : undefined',
        '[style.display]': 'hiddenSignal() ? "none" : undefined',
        '[style.--radix-collapsible-content-width.px]': 'width()',
        '[style.--radix-collapsible-content-height.px]': 'height()',
        '(animationend)': 'onAnimationEnd()'
    }
})
export class RdxCollapsibleContentDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly rootContext = injectCollapsibleRootContext()!;

    readonly isOpen = computed(() => this.rootContext.open());

    readonly height = signal(0);
    readonly width = signal(0);
    readonly isMountAnimationPrevented = signal(true);

    private originalStyles: { transition: string; animation: string } = {
        transition: '',
        animation: ''
    };

    protected readonly hiddenSignal = signal(false);

    constructor() {
        watch([this.isOpen], ([isOpen]) => {
            if (isOpen) {
                this.hiddenSignal.set(false);

                setTimeout(() => {
                    const node = this.elementRef.nativeElement;
                    if (!node) return;

                    node.style.transition = 'none';
                    node.style.animation = 'none';

                    const rect = node.getBoundingClientRect();
                    this.height.set(rect.height);
                    this.width.set(rect.width);

                    if (!this.isMountAnimationPrevented()) {
                        node.style.transition = this.originalStyles.transition;
                        node.style.animation = this.originalStyles.animation;
                    }
                });
            }
        });

        afterNextRender(() => {
            this.originalStyles = {
                transition: this.elementRef.nativeElement.style.transition,
                animation: this.elementRef.nativeElement.style.animation
            };
            requestAnimationFrame(() => {
                this.isMountAnimationPrevented.set(false);
            });
        });
    }

    onAnimationEnd() {
        if (!this.rootContext.open()) {
            this.hiddenSignal.set(true);
        }
    }
}
