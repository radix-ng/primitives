import { afterNextRender, Directive, ElementRef, inject, signal } from '@angular/core';
import { injectSelectContentContext } from './select-content';

@Directive({
    selector: '[rdxSelectViewport]',
    host: {
        role: 'presentation',
        '[attr.data-rdx-select-viewport]': '""',
        '[style]': `{
            position: 'relative',
            flex: 1,
            overflow: 'hidden auto',
            scrollbarWidth: 'none'
        }`,
        '(scroll)': 'handleScroll($event)'
    }
})
export class RdxSelectViewport {
    private readonly contentContext = injectSelectContentContext()!;
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    private readonly prevScrollTopRef = signal(0);

    constructor() {
        afterNextRender(() => {
            this.contentContext?.onViewportChange(this.elementRef.nativeElement);
        });
    }

    handleScroll(event: MouseEvent) {
        const viewport = event.currentTarget as HTMLElement;

        this.prevScrollTopRef.set(viewport.scrollTop);
    }
}
