import { Component } from '@angular/core';
import { CalendarDate } from '@internationalized/date';
import { RdxCalendarCellTriggerDirective } from '../src/calendar-cell-trigger.directive';
import { RdxCalendarGridHeadDirective } from '../src/calendar-grid-head.directive';
import { RdxCalendarGridDirective } from '../src/calendar-grid.directive';
import { RdxCalendarHeaderDirective } from '../src/calendar-header.directive';
import { RdxCalendarHeadingDirective } from '../src/calendar-heading.directive';
import { RdxCalendarNextDirective } from '../src/calendar-next.directive';
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
        RdxCalendarNextDirective
    ],
    styleUrl: 'calendar-default.style.css',
    template: `
        <div style="max-width: 680px; width: 300px;">
            <div
                #root="rdxCalendarRoot"
                [value]="date"
                style="margin-top: 1.5rem;border-radius: 0.75rem;background-color: #ffffff;padding: 1rem;box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);border: 1px solid #e5e7eb;"
                rdxCalendarRoot
                fixedWeeks
            >
                <div rdxCalendarHeader style="display: flex;align-items: center;justify-content: space-between;">
                    <button class="icon-button">
                        <svg
                            class="iconify iconify--radix-icons h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            aria-hidden="true"
                            role="img"
                            style=""
                            width="1em"
                            height="1em"
                            viewBox="0 0 15 15"
                        >
                            <path
                                fill="currentColor"
                                fill-rule="evenodd"
                                d="M8.842 3.135a.5.5 0 0 1 .023.707L5.435 7.5l3.43 3.658a.5.5 0 0 1-.73.684l-3.75-4a.5.5 0 0 1 0-.684l3.75-4a.5.5 0 0 1 .707-.023"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                    </button>
                    <div
                        #head="rdxCalendarHeading"
                        rdxCalendarHeading
                        style="font-size: 0.875rem;color: #000000;font-weight: 500;"
                    >
                        {{ head.headingValue() }}
                    </div>
                    <button class="icon-button" rdxCalendarNext>
                        <svg
                            class="iconify iconify--radix-icons h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            aria-hidden="true"
                            role="img"
                            style=""
                            width="1em"
                            height="1em"
                            viewBox="0 0 15 15"
                        >
                            <path
                                fill="currentColor"
                                fill-rule="evenodd"
                                d="M6.158 3.135a.5.5 0 0 1 .707.023l3.75 4a.5.5 0 0 1 0 .684l-3.75 4a.5.5 0 1 1-.73-.684L9.566 7.5l-3.43-3.658a.5.5 0 0 1 .023-.707"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                    </button>
                </div>
                <div class="CalendarContainer">
                    <table class="CalendarGrid" rdxCalendarGrid>
                        @for (month of root.months(); track month) {
                            <thead rdxCalendarGridHead>
                                <tr
                                    style="display: grid;width: 100%;grid-template-columns: repeat(7,minmax(0,1fr)); margin-bottom: .25rem;"
                                >
                                    @for (day of root.weekDays(); track $index) {
                                        <th class="CalendarHeadCell">{{ day }}</th>
                                    }
                                </tr>
                            </thead>
                            <tbody rdxCalendarGridBody style="display: grid;">
                                @for (weekDates of month.weeks; track $index) {
                                    <tr style="display: grid; grid-template-columns: repeat(7, 1fr);">
                                        @for (weekDate of weekDates; track $index) {
                                            <td style="position:relative; text-align: center; font-size: 0.8rem;">
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
    readonly date = new CalendarDate(2024, 10, 3);
}
