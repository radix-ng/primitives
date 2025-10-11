import { Directive, inject } from '@angular/core';
import { RdxPopperArrow } from '@radix-ng/primitives/popper';
import { RdxVisuallyHiddenDirective } from '@radix-ng/primitives/visually-hidden';

@Directive({
    selector: '[rdxTooltipArrow]',
    hostDirectives: [RdxPopperArrow],
    host: {
        '[hidden]': 'isVisuallyHidden'
    }
})
export class RdxTooltipArrow {
    protected readonly isVisuallyHidden = !!inject(RdxVisuallyHiddenDirective, {
        optional: true
    });
}
