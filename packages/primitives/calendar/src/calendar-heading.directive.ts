import { computed, Directive } from '@angular/core';
import { injectCalendarRootContext } from './calendar-context.token';

@Directive({
    selector: 'div[rdxCalendarHeading]',
    exportAs: 'rdxCalendarHeading',
    host: {
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined'
    }
})
export class RdxCalendarHeadingDirective {
    protected readonly rootContext = injectCalendarRootContext();

    readonly headingValue = computed(() => this.rootContext.headingValue());
}
