import { Directive, inject } from '@angular/core';
import { RdxTooltipContentToken } from './tooltip-content.token';
import { RdxTooltipRootDirective } from './tooltip-root.directive';

@Directive({
    selector: '[rdxTooltipContentAttributes]',
    host: {
        '[attr.data-state]': 'tooltipRoot.state()',
        '[attr.data-side]': 'tooltipContent.side()'
    }
})
export class RdxTooltipContentAttributesDirective {
    readonly tooltipRoot = inject(RdxTooltipRootDirective);
    readonly tooltipContent = inject(RdxTooltipContentToken);
}
