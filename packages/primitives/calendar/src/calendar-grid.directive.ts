import { Directive } from '@angular/core';

@Directive({
    selector: 'table[rdxCalendarGrid]',
    host: {
        tabindex: '-1',
        role: 'grid'
    }
})
export class RdxCalendarGridDirective {}
