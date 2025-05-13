import { afterNextRender, computed, Directive, ElementRef, inject } from '@angular/core';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

@Directive({
    selector: '[rdxCollapsibleContent]',
    host: {
        '[attr.id]': 'rootContext.contentId',
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-disabled]': 'rootContext.disabled() ? "true" : undefined',
        '[attr.hidden]': '!rootContext.open() || undefined',
        '[style]': 'style()'
    }
})
export class RdxCollapsibleContentDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly rootContext = injectCollapsibleRootContext()!;

    protected style = computed(() => ({
        '--radix-collapsible-content-height': `${this.dimensions().height}px`,
        '--radix-collapsible-content-width': `${this.dimensions().width}px`
    }));

    private dimensions = computed(() => {
        this.rootContext.open();

        this.elementRef.nativeElement.style.transitionDuration = '0s';
        this.elementRef.nativeElement.style.animationName = 'none';

        const rect = this.elementRef.nativeElement.getBoundingClientRect();

        if (this.wasMountAnimationPrevented) {
            this.elementRef.nativeElement.style.transitionDuration = this.originalStyles.transitionDuration;
            this.elementRef.nativeElement.style.animationName = this.originalStyles.animationName;
        }

        return rect;
    });

    private originalStyles!: {
        transitionDuration: string;
        animationName: string;
    };

    private wasMountAnimationPrevented = false;

    constructor() {
        afterNextRender(() => {
            this.originalStyles = {
                transitionDuration: this.elementRef.nativeElement.style.transitionDuration,
                animationName: this.elementRef.nativeElement.style.animationName
            };

            requestAnimationFrame(() => {
                this.wasMountAnimationPrevented = true;
            });
        });
    }
}
