import { computed, Directive } from '@angular/core';
import { injectCalendarRootContext } from './сalendar-сontext.token';

@Directive({
    selector: 'div[rdxCalendarHeading]',
    exportAs: 'rdxCalendarHeading'
})
export class RdxCalendarHeadingDirective {
    private readonly rootContext = injectCalendarRootContext();

    readonly headingValue = computed(() => this.rootContext.headingValue());
}
