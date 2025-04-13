import { Directive, input } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { injectCalendarRootContext } from './сalendar-сontext.token';

@Directive({
    selector: 'button[rdxCalendarNext]',
    host: {
        '(click)': 'onClick()'
    }
})
export class RdxCalendarNextDirective {
    protected readonly rootContext = injectCalendarRootContext();

    readonly nextPage = input<(placeholder: DateValue) => DateValue>();

    protected onClick() {
        this.rootContext.nextPage!(this.nextPage());
    }
}
