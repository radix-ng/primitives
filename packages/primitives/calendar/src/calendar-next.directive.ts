import { computed, Directive, input } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { injectCalendarRootContext } from './сalendar-сontext.token';

@Directive({
    selector: 'button[rdxCalendarNext]',
    exportAs: 'rdxCalendarNext',
    host: {
        '(click)': 'onClick()',
        '[disabled]': 'disabled()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.aria-disabled]': 'disabled() ? "" : undefined',
        'aria-label': 'Next page'
    }
})
export class RdxCalendarNextDirective {
    protected readonly rootContext = injectCalendarRootContext();

    /**
     * The function to be used for the `next page`. Overwrites the nextPage function set on the `CalendarRoot`.
     */
    readonly nextPage = input<(placeholder: DateValue) => DateValue>();

    /**
     * @ignore
     */
    readonly disabled = computed(
        () => this.rootContext.disabled() || this.rootContext.isNextButtonDisabled(this.nextPage())
    );

    protected onClick() {
        this.rootContext.nextPage!(this.nextPage());
    }
}
