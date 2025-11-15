import { Directive, effect, inject, signal } from '@angular/core';
import { injectSelectContentContext } from './select-content';
import { RdxSelectScrollButtonBase } from './select-scroll-button-base';

@Directive({
    selector: '[rdxSelectScrollUpButton]',
    hostDirectives: [RdxSelectScrollButtonBase],
    host: {
        '[hidden]': '!canScrollUp()'
    }
})
export class RdxSelectScrollUpButton {
    private readonly contentContext = injectSelectContentContext()!;

    readonly canScrollUp = signal<boolean>(false);

    constructor() {
        inject(RdxSelectScrollButtonBase).autoScroll.subscribe(() => {
            const { viewport, selectedItem } = this.contentContext;

            if (viewport() && selectedItem()) {
                viewport()!.scrollTop = viewport()!.scrollTop - selectedItem()!.offsetHeight;
            }
        });

        effect((cleanup) => {
            if (this.contentContext.viewport() && this.contentContext.isPositioned()) {
                const viewport = this.contentContext.viewport()!;

                const handleScroll = () => {
                    this.canScrollUp.set(viewport.scrollTop > 0);
                };

                handleScroll();
                viewport.addEventListener('scroll', handleScroll);

                cleanup(() => viewport.removeEventListener('scroll', handleScroll));
            }
        });
    }
}
