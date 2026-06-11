import { Directive } from '@angular/core';
import { RdxPopperContent } from '@radix-ng/primitives/popper';
import { injectSelectRootContext } from './select-root';

@Directive({
    selector: '[rdxSelectPositionerContent]',
    hostDirectives: [RdxPopperContent],
    host: {
        role: 'listbox',
        '[id]': 'rootContext.contentId'
    }
})
export class RdxSelectPositionerContent {
    protected rootContext = injectSelectRootContext();
}
