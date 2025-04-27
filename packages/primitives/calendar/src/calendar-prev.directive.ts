import { computed, Directive, input } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { injectCalendarRootContext } from './сalendar-сontext.token';

@Directive({
    selector: 'button[rdxCalendarPrev]',
    exportAs: 'rdxCalendarPrev',
    host: {
        '(click)': 'onClick()',
        '[disabled]': 'disabled()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.aria-disabled]': 'disabled() ? "" : undefined',
        'aria-label': 'Previous page'
    }
})
export class RdxCalendarPrevDirective {
    protected readonly rootContext = injectCalendarRootContext();

    /**
     * The function to be used for the `prev page`. Overwrites the prevPage function set on the `CalendarRoot`.
     */
    readonly prevPage = input<(placeholder: DateValue) => DateValue>();

    /**
     * @ignore
     */
    readonly disabled = computed(
        () => this.rootContext.disabled() || this.rootContext.isNextButtonDisabled(this.prevPage())
    );

    protected onClick() {
        this.rootContext.prevPage!(this.prevPage());
    }
}
