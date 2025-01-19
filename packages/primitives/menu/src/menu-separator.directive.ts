import { Directive } from '@angular/core';

@Directive({
    selector: '[MenuSeparator]',
    host: {
        role: 'separator',
        '[attr.aria-orientation]': "'horizontal'"
    }
})
export class RdxMenuSeparatorDirective {}
