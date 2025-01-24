import { Directive } from '@angular/core';

@Directive({
    selector: '[RdxMenuSeparator]',
    host: {
        role: 'separator',
        '[attr.aria-orientation]': "'horizontal'"
    }
})
export class RdxMenuSeparatorDirective {}
