# Calendar — Default

> One example from the [Calendar](../components/calendar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

The preview above uses this standalone component. Copy the setup and shared files below as well.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CalendarDate, DateValue } from '@internationalized/date';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import {
    RdxCalendarCellDirective,
    RdxCalendarCellTriggerDirective,
    RdxCalendarGridBodyDirective,
    RdxCalendarGridDirective,
    RdxCalendarGridHeadDirective,
    RdxCalendarHeadCellDirective,
    RdxCalendarHeaderDirective,
    RdxCalendarHeadingDirective,
    RdxCalendarNextDirective,
    RdxCalendarPrevDirective,
    RdxCalendarRootDirective
} from '@radix-ng/primitives/calendar';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-calendar-default',
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
        <div class="demo-calendar-root w-[300px] p-4" #root="rdxCalendarRoot" [value]="date" rdxCalendarRoot fixedWeeks>
            <div class="flex items-center justify-between" rdxCalendarHeader>
                <button
                    class="demo-button-ghost demo-focus inline-flex size-7 cursor-pointer items-center justify-center rounded-md"
                    type="button"
                    rdxCalendarPrev
                >
                    <svg lucideChevronLeft size="16" />
                </button>
                <div class="demo-label" #head="rdxCalendarHeading" rdxCalendarHeading>{{ head.headingValue() }}</div>
                <button
                    class="demo-button-ghost demo-focus inline-flex size-7 cursor-pointer items-center justify-center rounded-md"
                    type="button"
                    rdxCalendarNext
                >
                    <svg lucideChevronRight size="16" />
                </button>
            </div>

            <table class="mt-4 w-full border-collapse select-none" rdxCalendarGrid>
                @for (month of root.months(); track $index) {
                    <thead rdxCalendarGridHead>
                        <tr class="grid w-full grid-cols-7">
                            @for (day of root.weekDays(); track $index) {
                                <th class="demo-calendar-head-cell" rdxCalendarHeadCell>{{ day }}</th>
                            }
                        </tr>
                    </thead>
                    <tbody class="grid" rdxCalendarGridBody>
                        @for (weekDates of month.weeks; track $index) {
                            <tr class="grid grid-cols-7">
                                @for (weekDate of weekDates; track $index) {
                                    <td class="relative text-center text-sm" [date]="weekDate" rdxCalendarCell>
                                        <div
                                            class="demo-calendar-day data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[highlighted]:bg-muted data-[outside-view]:text-muted-foreground/60 data-[unavailable]:text-muted-foreground/60 data-[today]:before:bg-primary demo-focus relative mx-auto flex size-8 items-center justify-center data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[today]:before:absolute data-[today]:before:top-1 data-[today]:before:size-1 data-[today]:before:rounded-full data-[today]:before:content-[''] data-[unavailable]:pointer-events-none data-[unavailable]:line-through"
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
    `
})
export class CalendarDefault {
    date: DateValue = new CalendarDate(2024, 10, 3);
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@internationalized/date`, `@lucide/angular` when an example imports them.
