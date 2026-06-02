import { Directive, effect, inject, signal } from '@angular/core';
import { injectSelectContentContext } from './select-content';
import { RdxSelectScrollButtonBase } from './select-scroll-button-base';

@Directive({
    selector: '[rdxSelectScrollDownButton]',
    hostDirectives: [RdxSelectScrollButtonBase],
    host: {
        '[hidden]': '!canScrollDown()'
    }
})
export class RdxSelectScrollDownButton {
    private readonly contentContext = injectSelectContentContext()!;

    readonly canScrollDown = signal<boolean>(false);

    constructor() {
        inject(RdxSelectScrollButtonBase).autoScroll.subscribe(() => {
            const { viewport, selectedItem } = this.contentContext;

            if (viewport() && selectedItem()) {
                viewport()!.scrollTop = viewport()!.scrollTop + selectedItem()!.offsetHeight;
            }
        });

        effect((cleanup) => {
            if (this.contentContext.viewport() && this.contentContext.isPositioned()) {
                const viewport = this.contentContext.viewport()!;

                const handleScroll = () => {
                    const maxScroll = viewport.scrollHeight - viewport.clientHeight;
                    // we use Math.ceil here because if the UI is zoomed-in
                    // `scrollTop` is not always reported as an integer
                    this.canScrollDown.set(Math.ceil(viewport.scrollTop) < maxScroll);
                };

                handleScroll();
                viewport.addEventListener('scroll', handleScroll);

                cleanup(() => viewport.removeEventListener('scroll', handleScroll));
            }
        });
    }
}
