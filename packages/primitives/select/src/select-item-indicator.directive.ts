import { Directive, inject } from '@angular/core';
import { RdxSelectItemDirective } from './select-item.directive';

@Directive({
    selector: '[rdxSelectItemIndicator]',
    standalone: true,
    exportAs: 'rdxSelectItemIndicator',
    host: {
        '[attr.aria-hidden]': 'true',
        '[style.display]': 'item.selected ? "" : "none"'
    }
})
export class RdxSelectItemIndicatorDirective {
    protected item = inject(RdxSelectItemDirective);
}
