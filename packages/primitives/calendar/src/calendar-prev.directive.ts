import { Directive, input } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { injectCalendarRootContext } from './сalendar-сontext.token';

@Directive({
    selector: 'button[rdxCalendarPrev]',
    host: {
        '(click)': 'onClick()'
    }
})
export class RdxCalendarPrevDirective {
    protected readonly rootContext = injectCalendarRootContext();

    readonly prevPage = input<(placeholder: DateValue) => DateValue>();

    protected onClick() {
        this.rootContext.prevPage!(this.prevPage());
    }
}
