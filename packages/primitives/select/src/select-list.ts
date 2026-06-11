import { afterNextRender, Directive, ElementRef, inject, signal } from '@angular/core';
import { injectSelectPopupContext } from './select-popup';

@Directive({
    selector: '[rdxSelectList]',
    host: {
        role: 'presentation',
        '[attr.data-rdx-select-list]': '""',
        '[style]': `{
            position: 'relative',
            flex: 1,
            overflow: 'hidden auto',
            scrollbarWidth: 'none'
        }`,
        '(scroll)': 'handleScroll($event)'
    }
})
export class RdxSelectList {
    private readonly contentContext = injectSelectPopupContext();
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    private readonly prevScrollTopRef = signal(0);

    constructor() {
        afterNextRender(() => {
            this.contentContext?.onViewportChange(this.elementRef.nativeElement);
        });
    }

    handleScroll(event: Event) {
        const viewport = event.currentTarget as HTMLElement;

        this.prevScrollTopRef.set(viewport.scrollTop);
    }
}
