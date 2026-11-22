# Calendar — Week numbers

> One example from the [Calendar](../components/calendar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Render an extra leading column with the ISO week number via `getWeekNumber`.

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
                        <tr class="mt-4 grid w-full grid-cols-8">
                            <th class="demo-calendar-head-cell" rdxCalendarHeadCell>Wk</th>
                            @for (day of root.weekDays(); track $index) {
                                <th class="demo-calendar-head-cell" rdxCalendarHeadCell>{{ day }}</th>
                            }
                        </tr>
                    </thead>
                    <tbody class="grid" rdxCalendarGridBody>
                        @for (weekDates of month.weeks; track $index) {
                            <tr class="grid grid-cols-8">
                                <div class="text-muted-foreground flex items-center justify-center text-xs">
                                    {{ getWeekNumber(weekDates[0]) }}
                                </div>
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
export class CalendarWeek {
    date: DateValue = new CalendarDate(2024, 10, 3);
    protected readonly getWeekNumber = getWeekNumber;
}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@internationalized/date`, `@lucide/angular`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
