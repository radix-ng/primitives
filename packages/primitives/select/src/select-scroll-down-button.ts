import { Directive, inject } from '@angular/core';
import { injectSelectPopupContext } from './select-popup';
import { RdxSelectScrollButtonBase } from './select-scroll-button-base';

@Directive({
    selector: '[rdxSelectScrollDownButton]',
    hostDirectives: [RdxSelectScrollButtonBase],
    host: {
        '[hidden]': '!canScrollDown()'
    }
})
export class RdxSelectScrollDownButton {
    private readonly contentContext = injectSelectPopupContext();

    readonly canScrollDown = this.contentContext.canScrollDown;

    constructor() {
        inject(RdxSelectScrollButtonBase).autoScroll.subscribe(() => {
            const { viewport, selectedItem } = this.contentContext;

            if (viewport() && selectedItem()) {
                viewport()!.scrollTop = viewport()!.scrollTop + selectedItem()!.offsetHeight;
            }
        });
    }
}
