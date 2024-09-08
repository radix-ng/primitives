import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxDialogContent]',
    standalone: true,
    host: {
        role: 'dialog',
        '[attr.aria-describedby]': '"true"',
        '[attr.aria-labelledby]': '"true"',
        '[attr.data-state]': '"true"'
    }
})
export class RdxDialogContentDirective {}
