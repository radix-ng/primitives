import { computed, Directive, input } from '@angular/core';
import { DateValue } from '@internationalized/date';

@Directive({
    selector: '[rdxCalendarCellTrigger]',
    exportAs: 'rdxCalendarCellTrigger',
    host: {
        role: 'button'
    }
})
export class RdxCalendarCellTriggerDirective {
    readonly day = input<DateValue>();

    readonly month = input();

    readonly dayValue = computed(() => this.day()?.day.toLocaleString());
}
