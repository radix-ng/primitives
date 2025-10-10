import { contentChild, Directive } from '@angular/core';
import { RdxPopperAnchor } from './popper-anchor';

@Directive({
    selector: '[rdxPopperRoot]'
})
export class RdxPopper {
    readonly anchor = contentChild.required(RdxPopperAnchor);
}
