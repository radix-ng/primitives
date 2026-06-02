import { Directive } from '@angular/core';
import { RdxPopperContent } from '@radix-ng/primitives/popper';
import { injectSelectRootContext } from './select-root';

@Directive({
    selector: '[rdxSelectPopperPositionContent]',
    hostDirectives: [RdxPopperContent],
    host: {
        role: 'listbox',
        '[id]': 'rootContext.contentId'
    }
})
export class RdxSelectPopperPositionContent {
    protected rootContext = injectSelectRootContext()!;
}
