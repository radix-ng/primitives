import { Directive } from '@angular/core';
import { RdxPopperArrow } from '@radix-ng/primitives/popper';

/**
 * An optional arrow element rendered alongside the popover.
 */
@Directive({
    selector: '[rdxPopoverArrow]',
    hostDirectives: [RdxPopperArrow]
})
export class RdxPopoverArrow {}
