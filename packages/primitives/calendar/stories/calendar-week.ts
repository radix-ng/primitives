import { Component } from '@angular/core';
import { CalendarDate, DateValue } from '@internationalized/date';
import { getWeekNumber } from '@radix-ng/primitives/core';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { RdxCalendarCellTriggerDirective } from '../src/calendar-cell-trigger.directive';
import { RdxCalendarCellDirective } from '../src/calendar-cell.directive';
import { RdxCalendarGridHeadDirective } from '../src/calendar-grid-head.directive';
import { RdxCalendarGridDirective } from '../src/calendar-grid.directive';
import { RdxCalendarHeadCellDirective } from '../src/calendar-head-cell.directive';
import { RdxCalendarHeaderDirective } from '../src/calendar-header.directive';
import { RdxCalendarHeadingDirective } from '../src/calendar-heading.directive';
import { RdxCalendarNextDirective } from '../src/calendar-next.directive';
import { RdxCalendarPrevDirective } from '../src/calendar-prev.directive';
import { RdxCalendarRootDirective } from '../src/calendar-root.directive';

@Component({
    selector: 'app-calendar-week',
    imports: [
        RdxCalendarRootDirective,
        RdxCalendarHeaderDirective,
        RdxCalendarGridDirective,
        RdxCalendarGridHeadDirective,
        RdxCalendarCellTriggerDirective,
        RdxCalendarCellDirective,
        RdxCalendarHeadingDirective,
        RdxCalendarNextDirective,
        RdxCalendarPrevDirective,
        LucideAngularModule,
        RdxCalendarHeadCellDirective
    ],
    styleUrl: 'calendar-default.style.css',
    template: `
        <div class="wrapper">
            <div
                class="calendar-root"
                #root="rdxCalendarRoot"
                [value]="date"
                data-testid="calendar"
                rdxCalendarRoot
                fixedWeeks
            >
                <div class="calendar-header" rdxCalendarHeader>
                    <button class="icon-button" type="button" rdxCalendarPrev>
                        <lucide-angular [img]="ChevronLeft" size="16" style="display: flex;" />
                    </button>
                    <div class="calendar-heading" #head="rdxCalendarHeading" data-testid="heading" rdxCalendarHeading>
                        {{ head.headingValue() }}
                    </div>
                    <button class="icon-button" type="button" data-testid="next-button" rdxCalendarNext>
                        <lucide-angular [img]="ChevronRight" size="16" style="display: flex;" />
                    </button>
                </div>

                <div class="calendar-container">
                    <table class="calendar-grid" rdxCalendarGrid>
                        @for (month of root.months(); track $index) {
                            <thead rdxCalendarGridHead>
                                <tr
                                    class="calendar-grid-head-row"
                                    style="grid-template-columns: repeat(8, minmax(0, 1fr));"
                                >
                                    <th class="calendar-head-cell" rdxCalendarHeadCell>Wk</th>
                                    @for (day of root.weekDays(); track $index) {
                                        <th class="calendar-head-cell" rdxCalendarHeadCell>{{ day }}</th>
                                    }
                                </tr>
                            </thead>
                            <tbody class="calendar-grid-body" rdxCalendarGridBody>
                                @for (weekDates of month.weeks; track $index) {
                                    <tr class="calendar-week-row" style="grid-template-columns: repeat(8, 1fr);">
                                        <div>{{ getWeekNumber(weekDates[0]) }}</div>
                                        @for (weekDate of weekDates; track $index) {
                                            <td class="calendar-cell-wrapper" [date]="weekDate" rdxCalendarCell>
                                                <div
                                                    class="calendar-day"
                                                    #cell="rdxCalendarCellTrigger"
                                                    [day]="weekDate"
                                                    [month]="month.value"
                                                    rdxCalendarCellTrigger
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
            </div>
        </div>
    `
})
export class CalendarWeek {
    date: DateValue = new CalendarDate(2024, 10, 3);

    protected readonly ChevronLeft = ChevronLeft;
    protected readonly ChevronRight = ChevronRight;
    protected readonly getWeekNumber = getWeekNumber;
}
