import { cn, demoCalendar } from '../../storybook/styles';
import { RdxCalendarCellDirective } from '../src/calendar-cell.directive';
import { RdxCalendarCellTriggerDirective } from '../src/calendar-cell-trigger.directive';
import { RdxCalendarGridDirective } from '../src/calendar-grid.directive';
import { RdxCalendarGridBodyDirective } from '../src/calendar-grid-body.directive';
import { RdxCalendarGridHeadDirective } from '../src/calendar-grid-head.directive';
import { RdxCalendarHeadCellDirective } from '../src/calendar-head-cell.directive';
import { RdxCalendarHeaderDirective } from '../src/calendar-header.directive';
import { RdxCalendarHeadingDirective } from '../src/calendar-heading.directive';
import { RdxCalendarNextDirective } from '../src/calendar-next.directive';
import { RdxCalendarPrevDirective } from '../src/calendar-prev.directive';
import { RdxCalendarRootDirective } from '../src/calendar-root.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CalendarDate, DateValue } from '@internationalized/date';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { getWeekNumber } from '@radix-ng/primitives/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-calendar-week',
    imports: [
        RdxCalendarRootDirective,
        RdxCalendarHeaderDirective,
        RdxCalendarGridDirective,
        RdxCalendarGridHeadDirective,
        RdxCalendarGridBodyDirective,
        RdxCalendarCellTriggerDirective,
        RdxCalendarCellDirective,
        RdxCalendarHeadCellDirective,
        RdxCalendarHeadingDirective,
        RdxCalendarNextDirective,
        RdxCalendarPrevDirective,
        LucideChevronLeft,
        LucideChevronRight
    ],
    template: `
        <div #root="rdxCalendarRoot" rdxCalendarRoot fixedWeeks [class]="c.root" [value]="date">
            <div rdxCalendarHeader [class]="c.header">
                <button type="button" rdxCalendarPrev [class]="c.nav">
                    <svg lucideChevronLeft size="16" />
                </button>
                <div #head="rdxCalendarHeading" rdxCalendarHeading [class]="c.heading">{{ head.headingValue() }}</div>
                <button type="button" rdxCalendarNext [class]="c.nav">
                    <svg lucideChevronRight size="16" />
                </button>
            </div>

            <table rdxCalendarGrid [class]="c.grid">
                @for (month of root.months(); track $index) {
                    <thead rdxCalendarGridHead>
                        <tr class="mt-4 grid w-full grid-cols-8">
                            <th rdxCalendarHeadCell [class]="c.headCell">Wk</th>
                            @for (day of root.weekDays(); track $index) {
                                <th rdxCalendarHeadCell [class]="c.headCell">{{ day }}</th>
                            }
                        </tr>
                    </thead>
                    <tbody rdxCalendarGridBody [class]="c.body">
                        @for (weekDates of month.weeks; track $index) {
                            <tr class="grid grid-cols-8">
                                <div class="text-muted-foreground flex items-center justify-center text-xs">
                                    {{ getWeekNumber(weekDates[0]) }}
                                </div>
                                @for (weekDate of weekDates; track $index) {
                                    <td rdxCalendarCell [class]="c.cell" [date]="weekDate">
                                        <div
                                            #cell="rdxCalendarCellTrigger"
                                            rdxCalendarCellTrigger
                                            [class]="c.day"
                                            [day]="weekDate"
                                            [month]="month.value"
                                        >
                                            {{ cell.dayValue() }}
                                        </div>
                                    </td>
                                }
                            </tr>
                        }
                    </tbody>
                }
            </table>
        </div>
    `
})
export class CalendarWeek {
    date: DateValue = new CalendarDate(2024, 10, 3);

    protected readonly cn = cn;
    protected readonly c = demoCalendar;
    protected readonly getWeekNumber = getWeekNumber;
}
