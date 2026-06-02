import { contentChild, Directive, signal } from '@angular/core';
import type { ReferenceElement } from '@floating-ui/dom';
import { RdxPopperAnchor } from './popper-anchor';

@Directive({
    selector: '[rdxPopperRoot]'
})
export class RdxPopper {
    readonly anchor = contentChild(RdxPopperAnchor);
    readonly anchorOverride = signal<ReferenceElement | undefined>(undefined);
}
