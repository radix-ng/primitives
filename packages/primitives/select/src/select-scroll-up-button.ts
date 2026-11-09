import { Directive, inject } from '@angular/core';
import { injectSelectPopupContext } from './select-popup';
import { RdxSelectScrollButtonBase } from './select-scroll-button-base';

@Directive({
    selector: '[rdxSelectScrollUpButton]',
    hostDirectives: [RdxSelectScrollButtonBase],
    host: {
        '[hidden]': '!canScrollUp()'
    }
})
export class RdxSelectScrollUpButton {
    private readonly contentContext = injectSelectPopupContext();

    readonly canScrollUp = this.contentContext.canScrollUp;

    constructor() {
        inject(RdxSelectScrollButtonBase).autoScroll.subscribe(() => {
            const { viewport, selectedItem } = this.contentContext;

            if (viewport() && selectedItem()) {
                viewport()!.scrollTop = viewport()!.scrollTop - selectedItem()!.offsetHeight;
            }
        });
    }
}
