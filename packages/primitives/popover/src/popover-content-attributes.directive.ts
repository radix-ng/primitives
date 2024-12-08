import { Directive, inject } from '@angular/core';
import { RdxPopoverContentToken } from './popover-content.token';
import { RdxPopoverRootDirective } from './popover-root.directive';

@Directive({
    selector: '[rdxPopoverContentAttributes]',
    standalone: true,
    host: {
        '[attr.data-state]': 'popoverRoot.state()',
        '[attr.data-side]': 'popoverContent.side()'
    }
})
export class RdxPopoverContentAttributesDirective {
    readonly popoverRoot = inject(RdxPopoverRootDirective);
    readonly popoverContent = inject(RdxPopoverContentToken);
}
