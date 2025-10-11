import { Directive } from '@angular/core';
import { RdxPopperContent } from '@radix-ng/primitives/popper';
import { injectRdxTooltipContext } from './tooltip';

@Directive({
    selector: '[rdxTooltipContent]',
    hostDirectives: [RdxPopperContent],
    host: {
        role: 'tooltip',
        '[id]': 'rootContext.contentId'
    }
})
export class RdxTooltipContent {
    protected rootContext = injectRdxTooltipContext()!;
}
