import { Directive } from '@angular/core';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';

/**
 * Optional positioning anchor for the popup. Put it on the element the popup should align to — for
 * example a control that wraps chips + input in `multiple` mode. When present it takes precedence
 * over the input (the popper resolves the first `RdxPopperAnchor` in DOM order, and this part sits
 * above the input). When absent, the input itself is the anchor, which is ideal when the input fills
 * the control.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxAnchor]',
    exportAs: 'rdxComboboxAnchor',
    hostDirectives: [RdxPopperAnchor]
})
export class RdxComboboxAnchor {}
