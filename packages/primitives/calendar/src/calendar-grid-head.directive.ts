import { Directive } from '@angular/core';

@Directive({
    selector: 'thead[rdxCalendarGridHead]',
    host: {
        '[attr.aria-hidden]': 'true'
    }
})
export class RdxCalendarGridHeadDirective {}
