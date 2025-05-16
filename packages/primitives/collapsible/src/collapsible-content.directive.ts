import { computed, Directive, ElementRef, inject, OnInit, signal } from '@angular/core';
import { watch } from '@radix-ng/primitives/core';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

@Directive({
    selector: '[rdxCollapsibleContent]',
    host: {
        id: 'rootContext.contentId()',

        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-disabled]': 'rootContext.disabled() ? "true" : undefined',
        '[style.display]': 'hiddenSignal() ? "none" : undefined',
        '[style.overflow]': '"hidden"',
        //  '[style.display]': "!rootContext.open() ? 'none' : undefined",
        '[style.--radix-collapsible-content-width.px]': 'width()',
        '[style.--radix-collapsible-content-height.px]': 'height()',
        '(animationstart)': 'onAnimationStart()',
        '(animationend)': 'onAnimationEnd()'
    }
})
export class RdxCollapsibleContentDirective implements OnInit {
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
            console.log('isOpen ', isOpen);
            if (isOpen) {
                this.hiddenSignal.set(false);

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

                    this.isMountAnimationPrevented.set(false);
                    console.log('requestAnimationFrame end');
                });
            }
        });
    }

    ngOnInit() {
        this.isMountAnimationPrevented.set(false);
    }

    onAnimationStart() {
        console.log('animation start');
    }

    onAnimationEnd() {
        console.log('animation end');

        if (!this.rootContext.open()) {
            this.hiddenSignal.set(true);
        }
    }
}
