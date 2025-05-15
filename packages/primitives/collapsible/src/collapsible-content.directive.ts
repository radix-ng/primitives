import { computed, Directive, ElementRef, inject, signal } from '@angular/core';
import { watch } from '@radix-ng/primitives/core';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

@Directive({
    selector: '[rdxCollapsibleContent]',
    host: {
        id: 'rootContext.contentId()',

        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-disabled]': 'rootContext.disabled() ? "true" : undefined',
        '[style.display]': "!rootContext.open() ? 'none' : undefined",
        '[style.--radix-collapsible-content-width.px]': 'width()',
        '[style.--radix-collapsible-content-height.px]': 'height()',
        '(animationstart)': 'onAnimationStart()',
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

    constructor() {
        watch([this.isOpen], ([value]) => {
            requestAnimationFrame(() => {
                const node = this.elementRef.nativeElement;
                if (!node) return;

                if (this.isMountAnimationPrevented()) {
                    this.originalStyles = {
                        transition: node.style.transition,
                        animation: node.style.animation
                    };
                }

                node.style.transition = 'none';
                node.style.animation = 'none';

                node.getBoundingClientRect();

                const rect = node.getBoundingClientRect();
                this.height.set(rect.height);
                this.width.set(rect.width);

                if (!this.isMountAnimationPrevented()) {
                    node.style.transition = this.originalStyles.transition;
                    node.style.animation = this.originalStyles.animation;
                }
            });
        });
    }

    ngOnInit() {
        setTimeout(() => {
            this.isMountAnimationPrevented.set(false);
        });
    }

    onAnimationStart() {
        console.log('animation start');
    }

    onAnimationEnd() {
        console.log('animation end');
    }
}
