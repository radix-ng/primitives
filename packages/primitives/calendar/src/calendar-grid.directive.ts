import { computed, Directive } from '@angular/core';
import { injectCalendarRootContext } from './сalendar-сontext.token';

@Directive({
    selector: 'table[rdxCalendarGrid]',
    host: {
        tabindex: '-1',
        role: 'grid',
        '[attr.aria-readonly]': 'readonly()',
        '[attr.aria-disabled]': 'disabled()',
        '[attr.data-readonly]': 'readonly() && ""',
        '[attr.data-disabled]': 'disabled() && ""'
    }
})
export class RdxCalendarGridDirective {
    private readonly rootContext = injectCalendarRootContext();

    readonly disabled = computed(() => (this.rootContext.disabled() ? true : undefined));
    readonly readonly = computed(() => (this.rootContext.readonly ? true : undefined));
}
