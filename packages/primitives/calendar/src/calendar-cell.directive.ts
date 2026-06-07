import { Directive, input } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { injectCalendarRootContext } from './calendar-context.token';

@Directive({
    selector: 'td[rdxCalendarCell]',
    host: {
        role: 'gridcell',
        '[attr.aria-selected]': 'rootContext.isDateSelected(date()!) ? true : undefined',
        '[attr.aria-disabled]':
            'rootContext.dateDisabled(date()!) || rootContext.dateUnavailable(date()!) ? true : undefined',
        '[attr.data-disabled]': 'rootContext.dateDisabled(date()!) ? "" : undefined'
    }
})
export class RdxCalendarCellDirective {
    protected readonly rootContext = injectCalendarRootContext();

    /**
     * The date of the cell
     */
    readonly date = input<DateValue>();
}
