import { Component } from '@angular/core';
import { CalendarDate, DateValue } from '@internationalized/date';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { RdxCalendarCellTriggerDirective } from '../src/calendar-cell-trigger.directive';
import { RdxCalendarGridHeadDirective } from '../src/calendar-grid-head.directive';
import { RdxCalendarGridDirective } from '../src/calendar-grid.directive';
import { RdxCalendarHeaderDirective } from '../src/calendar-header.directive';
import { RdxCalendarHeadingDirective } from '../src/calendar-heading.directive';
import { RdxCalendarNextDirective } from '../src/calendar-next.directive';
import { RdxCalendarPrevDirective } from '../src/calendar-prev.directive';
import { RdxCalendarRootDirective } from '../src/calendar-root.directive';

@Component({
    selector: 'app-calendar-default',
    imports: [
        RdxCalendarRootDirective,
        RdxCalendarHeaderDirective,
        RdxCalendarGridDirective,
        RdxCalendarGridHeadDirective,
        RdxCalendarCellTriggerDirective,
        RdxCalendarHeadingDirective,
        RdxCalendarNextDirective,
        RdxCalendarPrevDirective,
        LucideAngularModule
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
                                <tr class="calendar-grid-head-row">
                                    @for (day of root.weekDays(); track $index) {
                                        <th class="calendar-head-cell">{{ day }}</th>
                                    }
                                </tr>
                            </thead>
                            <tbody class="calendar-grid-body" rdxCalendarGridBody>
                                @for (weekDates of month.weeks; track $index) {
                                    <tr class="calendar-week-row">
                                        @for (weekDate of weekDates; track $index) {
                                            <td class="calendar-cell-wrapper">
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
export class CalendarDefaultComponent {
    date: DateValue = new CalendarDate(2024, 10, 3);

    protected readonly ChevronLeft = ChevronLeft;
    protected readonly ChevronRight = ChevronRight;
}
