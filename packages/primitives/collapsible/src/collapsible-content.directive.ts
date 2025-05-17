import { isPlatformServer } from '@angular/common';
import { computed, Directive, ElementRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { watch } from '@radix-ng/primitives/core';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

@Directive({
    selector: '[rdxCollapsibleContent]',
    host: {
        '[id]': 'rootContext.contentId()',
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-disabled]': 'rootContext.disabled() ? "true" : undefined',
        '[style.display]': 'hiddenSignal() ? "none" : undefined',
        '[style.--radix-collapsible-content-width.px]': 'width()',
        '[style.--radix-collapsible-content-height.px]': 'height()',
        '(animationend)': 'onAnimationEnd()'
    }
})
export class RdxCollapsibleContentDirective implements OnInit {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly platformId = inject(PLATFORM_ID);

    protected readonly rootContext = injectCollapsibleRootContext()!;

    readonly isOpen = computed(() => this.rootContext.open());

    readonly height = signal<number | null>(null);
    readonly width = signal<number | null>(null);

    protected readonly hiddenSignal = signal(false);

    constructor() {
        watch([this.isOpen], ([isOpen]) => {
            if (isOpen) {
                this.hiddenSignal.set(false);
            }
        });
    }

    ngOnInit() {
        this.getMeasurements();
    }

    onAnimationEnd() {
        this.hiddenSignal.set(!this.isOpen());

        this.getMeasurements();
    }

    getMeasurements() {
        if (isPlatformServer(this.platformId)) {
            return;
        }

        const node = this.elementRef.nativeElement;
        if (!node) return;

        const { width, height } = node.getBoundingClientRect();
        this.height.set(height);
        this.width.set(width);
    }
}
