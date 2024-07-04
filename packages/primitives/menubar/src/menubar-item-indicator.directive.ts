import { Directive } from '@angular/core';

@Directive({
    selector: '[MenubarItemIndicator]',
    standalone: true,
    host: {
        '[attr.data-state]': 'true'
    }
})
export class RdxMenubarItemIndicatorDirective {}
