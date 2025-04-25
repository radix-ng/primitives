import { Directive, input } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { injectCalendarRootContext } from './сalendar-сontext.token';

@Directive({
    selector: 'td[rdxCalendarCell]',
    host: {
        role: 'gridcell',
        '[attr.aria-selected]': 'rootContext.isDateSelected?.(date()!) ? true : undefined',
        '[attr.aria-disabled]': 'rootContext.isDateSelected?.(date()!) ||  rootContext.isDateUnavailable?.(date()!)',
        '[attr.data-disabled]': 'rootContext.isDateSelected?.(date()!) ? "" : undefined'
    }
})
export class RdxCalendarCellDirective {
    protected readonly rootContext = injectCalendarRootContext();

    readonly date = input<DateValue>();
}
