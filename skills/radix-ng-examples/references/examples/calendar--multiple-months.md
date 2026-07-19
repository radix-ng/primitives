# Calendar — Multiple months

> One example from the [Calendar](../components/calendar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Set `numberOfMonths` to render several months at once. Arrow-key navigation flows across the page
boundary between months, and (without `pagedNavigation`) the prev/next buttons shift the view by one month.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CalendarDate, DateValue } from '@internationalized/date';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { cn, demoCalendar } from '../../storybook/styles';
import { RdxCalendarCellTriggerDirective } from '../src/calendar-cell-trigger.directive';
import { RdxCalendarCellDirective } from '../src/calendar-cell.directive';
import { RdxCalendarGridBodyDirective } from '../src/calendar-grid-body.directive';
import { RdxCalendarGridHeadDirective } from '../src/calendar-grid-head.directive';
import { RdxCalendarGridDirective } from '../src/calendar-grid.directive';
import { RdxCalendarHeadCellDirective } from '../src/calendar-head-cell.directive';
import { RdxCalendarHeaderDirective } from '../src/calendar-header.directive';
import { RdxCalendarHeadingDirective } from '../src/calendar-heading.directive';
import { RdxCalendarNextDirective } from '../src/calendar-next.directive';
import { RdxCalendarPrevDirective } from '../src/calendar-prev.directive';
import { RdxCalendarRootDirective } from '../src/calendar-root.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-calendar-number-of-months',
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
        <div
            class="border-border bg-background rounded-xl border p-4 shadow-sm"
            #root="rdxCalendarRoot"
            [value]="date"
            [numberOfMonths]="2"
            rdxCalendarRoot
            fixedWeeks
        >
            <div [class]="c.header" rdxCalendarHeader>
                <button [class]="c.nav" type="button" rdxCalendarPrev>
                    <svg lucideChevronLeft size="16" />
                </button>
                <div #head="rdxCalendarHeading" [class]="c.heading" rdxCalendarHeading>{{ head.headingValue() }}</div>
                <button [class]="c.nav" type="button" rdxCalendarNext>
                    <svg lucideChevronRight size="16" />
                </button>
            </div>

            <div class="mt-4 flex gap-6">
                @for (month of root.months(); track $index) {
                    <table class="w-[260px] border-collapse select-none" rdxCalendarGrid>
                        <thead rdxCalendarGridHead>
                            <tr [class]="c.headRow">
                                @for (day of root.weekDays(); track $index) {
                                    <th [class]="c.headCell" rdxCalendarHeadCell>{{ day }}</th>
                                }
                            </tr>
                        </thead>
                        <tbody [class]="c.body" rdxCalendarGridBody>
                            @for (weekDates of month.weeks; track $index) {
                                <tr [class]="c.weekRow">
                                    @for (weekDate of weekDates; track $index) {
                                        <td [class]="c.cell" [date]="weekDate" rdxCalendarCell>
                                            <div
                                                #cell="rdxCalendarCellTrigger"
                                                [class]="c.day"
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
                    </table>
                }
            </div>
        </div>
    `
})
export class CalendarNumberOfMonths {
    date: DateValue = new CalendarDate(2024, 10, 3);

    protected readonly cn = cn;
    protected readonly c = demoCalendar;
}
```
