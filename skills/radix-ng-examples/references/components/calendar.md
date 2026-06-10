# Calendar

#### Displays dates and days of the week, facilitating date-related interactions.

```typescript
import { Component } from '@angular/core';
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
        <div #root="rdxCalendarRoot" [class]="c.root" [value]="date" rdxCalendarRoot fixedWeeks>
            <div [class]="c.header" rdxCalendarHeader>
                <button [class]="c.nav" type="button" rdxCalendarPrev>
                    <svg lucideChevronLeft size="16" />
                </button>
                <div #head="rdxCalendarHeading" [class]="c.heading" rdxCalendarHeading>{{ head.headingValue() }}</div>
                <button [class]="c.nav" type="button" rdxCalendarNext>
                    <svg lucideChevronRight size="16" />
                </button>
            </div>

            <table [class]="c.grid" rdxCalendarGrid>
                @for (month of root.months(); track $index) {
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
                }
            </table>
        </div>
    `
})
export class CalendarDefault {
    date: DateValue = new CalendarDate(2024, 10, 3);

    protected readonly cn = cn;
    protected readonly c = demoCalendar;
}
```

## Features

- ✅ Full keyboard navigation.
- ✅ Can be controlled or uncontrolled
- ✅ Focus is fully managed
- ✅ Localization support
- ✅ Highly composable

## Preface

The component depends on the [@internationalized/date package](https://react-spectrum.adobe.com/internationalized/date/index.html),
which solves a lot of the problems that come with working with dates and times in JavaScript.

We highly recommend reading through the documentation for the package to get a solid feel
for how it works, and you'll need to install it in your project to use the date-related components.

## Installation

Install the date package.

```bash
npm install @internationalized/date
```

Install the component from your command line.

```bash
npm install @radix-ng/primitives
```

## Anatomy

Import all parts and piece them together.

```html
<div rdxCalendarRoot #root="rdxCalendarRoot">
  <div rdxCalendarHeader>
    <button type="button" rdxCalendarPrev></button>
    <div #head="rdxCalendarHeading" rdxCalendarHeading>{{ head.headingValue() }}</div>
    <button type="button" rdxCalendarNext></button>
  </div>

  <table rdxCalendarGrid>
    @for (month of root.months(); track $index) {
    <thead rdxCalendarGridHead>
      <tr rdxCalendarGridRow>
        @for (day of root.weekDays(); track $index) {
        <th rdxCalendarHeadCell>{{ day }}</th>
        }
      </tr>
    </thead>
    <tbody rdxCalendarGridBody>
      @for (weekDates of month.weeks; track $index) {
      <tr rdxCalendarGridRow>
        @for (weekDate of weekDates; track $index) {
        <td rdxCalendarCell>
          <div #cell="rdxCalendarCellTrigger" rdxCalendarCellTrigger>{{ cell.dayValue() }}</div>
        </td>
        }
      </tr>
      }
    </tbody>
    }
  </table>
</div>
```

## API Reference

### Root

`RdxCalendarRootDirective` Contains all the parts of a calendar

### Header

`RdxCalendarHeaderDirective` Contains the navigation buttons and the heading segments.

### Prev Button

`RdxCalendarPrevDirective` Calendar navigation button. It navigates the calendar one month/year/decade in the past based on the current calendar view.

### Next Button

`RdxCalendarNextDirective` Calendar navigation button. It navigates the calendar one month/year/decade in the future based on the current calendar view.

### Heading

`RdxCalendarHeadingDirective` Heading for displaying the current month and year.

| exportAs       | Description                     |
| -------------- | ------------------------------- |
| `headingValue` | `string` Current month and year |

### Grid

`RdxCalendarGridDirective` Container for wrapping the calendar grid.

| Data Attribute    | Value                 |
| ----------------- | --------------------- |
| `[data-readonly]` | Present when readonly |
| `[data-disabled]` | Present when disabled |

### Grid Head

`RdxCalendarGridHeadDirective` Container for wrapping the grid head as `thead`.

### Grid Body

`RdxCalendarGridBodyDirective` Container for wrapping the grid body as `tbody`.

### Grid Row

`RdxCalendarGridRowDirective` Container for wrapping the grid row as `tr`.

### Head Cell

`RdxCalendarHeadCellDirective` Container for wrapping the head cell. Used for displaying the week days as `th`.

### Cell

`RdxCalendarCellDirective` Container for wrapping the calendar cells as `td`.

| Data Attribute    | Value                 |
| ----------------- | --------------------- |
| `[data-disabled]` | Present when disabled |

### Cell Trigger

`RdxCalendarCellTriggerDirective` Interactable container for displaying the cell dates. Clicking it selects the date.

| Data Attribute                | Value                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `[data-selected]`             | Present when selected                                                         |
| `[data-value]`                | The ISO string value of the date.                                             |
| `[data-disabled]`             | Present when disabled                                                         |
| `[data-unavailable]`          | Present when unavailable                                                      |
| `[data-today]`                | Present when today                                                            |
| `[data-outside-view]`         | Present when the date is outside the current month it is displayed in.        |
| `[data-outside-visible-view]` | Present when the date is outside the months that are visible on the calendar. |
| `[data-focused]`              | Present when focused                                                          |

## Examples

### Calendar with Locale and Calendar System Selection

This example showcases some of the available locales and how the calendar systems are displayed.

```typescript
import { Component, computed, signal } from '@angular/core';
import { CalendarIdentifier, createCalendar, getLocalTimeZone, toCalendar, today } from '@internationalized/date';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { cn, demoCalendar, demoInput } from '../../storybook/styles';
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
    selector: 'app-calendar-with-locale',
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
        <div class="flex w-[300px] flex-col gap-3">
            <label class="text-foreground flex flex-col gap-1 text-sm font-medium">
                Locale
                <select [class]="input" [value]="locale()" (change)="updateLocale($event)">
                    @for (option of preferences; track option.locale) {
                        <option [value]="option.locale">{{ option.label }}</option>
                    }
                </select>
            </label>

            <label class="text-foreground flex flex-col gap-1 text-sm font-medium">
                Calendar
                <select [class]="input" [value]="calendar()" (change)="updateCalendar($event)">
                    @for (option of preferredCalendars(); track option!.key) {
                        <option [value]="option!.key">{{ option!.name }}</option>
                    }
                </select>
            </label>

            <div
                #root="rdxCalendarRoot"
                [class]="c.root"
                [value]="value()"
                [locale]="locale()"
                rdxCalendarRoot
                fixedWeeks
            >
                <div [class]="c.header" rdxCalendarHeader>
                    <button [class]="c.nav" type="button" rdxCalendarPrev>
                        <svg lucideChevronLeft size="16" />
                    </button>
                    <div #head="rdxCalendarHeading" [class]="c.heading" rdxCalendarHeading>
                        {{ head.headingValue() }}
                    </div>
                    <button [class]="c.nav" type="button" rdxCalendarNext>
                        <svg lucideChevronRight size="16" />
                    </button>
                </div>

                <table [class]="c.grid" rdxCalendarGrid>
                    @for (month of root.months(); track $index) {
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
                    }
                </table>
            </div>
        </div>
    `
})
export class CalendarWithLocale {
    readonly preferences = [
        { locale: 'en-US', label: 'Default', ordering: 'gregory' },
        {
            label: 'Arabic (Algeria)',
            locale: 'ar-DZ',
            territories: 'DJ DZ EH ER IQ JO KM LB LY MA MR OM PS SD SY TD TN YE',
            ordering: 'gregory islamic islamic-civil islamic-tbla'
        },
        {
            label: 'Arabic (United Arab Emirates)',
            locale: 'ar-AE',
            territories: 'AE BH KW QA',
            ordering: 'gregory islamic-umalqura islamic islamic-civil islamic-tbla'
        },
        {
            label: 'Arabic (Egypt)',
            locale: 'AR-EG',
            territories: 'EG',
            ordering: 'gregory coptic islamic islamic-civil islamic-tbla'
        },
        {
            label: 'Arabic (Saudi Arabia)',
            locale: 'ar-SA',
            territories: 'SA',
            ordering: 'islamic-umalqura gregory islamic islamic-rgsa'
        },
        {
            label: 'Farsi (Iran)',
            locale: 'fa-IR',
            territories: 'IR',
            ordering: 'persian gregory islamic islamic-civil islamic-tbla'
        },
        {
            label: 'Farsi (Afghanistan)',
            locale: 'fa-AF',
            territories: 'AF IR',
            ordering: 'persian gregory islamic islamic-civil islamic-tbla'
        },
        { label: 'Amharic (Ethiopia)', locale: 'am-ET', territories: 'ET', ordering: 'gregory ethiopic ethioaa' },
        {
            label: 'Hebrew (Israel)',
            locale: 'he-IL',
            territories: 'IL',
            ordering: 'gregory hebrew islamic islamic-civil islamic-tbla'
        },
        { label: 'Hindi (India)', locale: 'hi-IN', territories: 'IN', ordering: 'gregory indian' },
        { label: 'Japanese (Japan)', locale: 'ja-JP', territories: 'JP', ordering: 'gregory japanese' },
        { label: 'Thai (Thailand)', locale: 'th-TH', territories: 'TH', ordering: 'buddhist gregory' },
        { label: 'Chinese (Taiwan)', locale: 'zh-TW', territories: 'TW', ordering: 'gregory roc chinese' }
    ];

    readonly calendars = [
        { key: 'gregory', name: 'Gregorian' },
        { key: 'japanese', name: 'Japanese' },
        { key: 'buddhist', name: 'Buddhist' },
        { key: 'roc', name: 'Taiwan' },
        { key: 'persian', name: 'Persian' },
        { key: 'indian', name: 'Indian' },
        { key: 'islamic-umalqura', name: 'Islamic (Umm al-Qura)' },
        { key: 'islamic-civil', name: 'Islamic Civil' },
        { key: 'islamic-tbla', name: 'Islamic Tabular' },
        { key: 'hebrew', name: 'Hebrew' },
        { key: 'coptic', name: 'Coptic' },
        { key: 'ethiopic', name: 'Ethiopic' },
        { key: 'ethioaa', name: 'Ethiopic (Amete Alem)' }
    ];

    readonly locale = signal(this.preferences[0].locale);
    readonly calendar = signal(this.calendars[0].key);

    readonly pref = computed(() => this.preferences.find((p) => p.locale === this.locale()));

    readonly preferredCalendars = computed(() => {
        const currentPref = this.pref();
        return currentPref
            ? currentPref.ordering
                  .split(' ')
                  .map((p) => this.calendars.find((c) => c.key === p))
                  .filter(Boolean)
            : [this.calendars[0]];
    });

    readonly value = computed(() =>
        toCalendar(today(getLocalTimeZone()), createCalendar(this.calendar() as CalendarIdentifier))
    );

    protected readonly cn = cn;
    protected readonly c = demoCalendar;
    protected readonly input = demoInput;

    updateLocale(event: Event) {
        const newLocale = (event.target as HTMLSelectElement).value;

        this.locale.set(newLocale);
        this.calendar.set(this.pref()!.ordering.split(' ')[0]);
    }

    updateCalendar(event: Event) {
        this.calendar.set((event.target as HTMLSelectElement).value);
    }
}
```

### Multiple selection

Set `multiple` to let the calendar hold an array of selected dates; clicking a selected date deselects it.

```typescript
import { Component, signal } from '@angular/core';
import { CalendarDate } from '@internationalized/date';
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
    selector: 'app-calendar-multiple',
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
        <div #root="rdxCalendarRoot" [class]="c.root" [value]="value()" rdxCalendarRoot multiple fixedWeeks>
            <div [class]="c.header" rdxCalendarHeader>
                <button [class]="c.nav" type="button" rdxCalendarPrev>
                    <svg lucideChevronLeft size="16" />
                </button>
                <div #head="rdxCalendarHeading" [class]="c.heading" rdxCalendarHeading>{{ head.headingValue() }}</div>
                <button [class]="c.nav" type="button" rdxCalendarNext>
                    <svg lucideChevronRight size="16" />
                </button>
            </div>

            <table [class]="c.grid" rdxCalendarGrid>
                @for (month of root.months(); track $index) {
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
                }
            </table>
        </div>
    `
})
export class CalendarMultiple {
    readonly value = signal([new CalendarDate(2025, 1, 15), new CalendarDate(2025, 1, 20)]);

    protected readonly cn = cn;
    protected readonly c = demoCalendar;
}
```

### Week numbers

Render an extra leading column with the ISO week number via `getWeekNumber`.

```typescript
import { Component } from '@angular/core';
import { CalendarDate, DateValue } from '@internationalized/date';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { getWeekNumber } from '@radix-ng/primitives/core';
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
        <div #root="rdxCalendarRoot" [class]="c.root" [value]="date" rdxCalendarRoot fixedWeeks>
            <div [class]="c.header" rdxCalendarHeader>
                <button [class]="c.nav" type="button" rdxCalendarPrev>
                    <svg lucideChevronLeft size="16" />
                </button>
                <div #head="rdxCalendarHeading" [class]="c.heading" rdxCalendarHeading>{{ head.headingValue() }}</div>
                <button [class]="c.nav" type="button" rdxCalendarNext>
                    <svg lucideChevronRight size="16" />
                </button>
            </div>

            <table [class]="c.grid" rdxCalendarGrid>
                @for (month of root.months(); track $index) {
                    <thead rdxCalendarGridHead>
                        <tr class="mt-4 grid w-full grid-cols-8">
                            <th [class]="c.headCell" rdxCalendarHeadCell>Wk</th>
                            @for (day of root.weekDays(); track $index) {
                                <th [class]="c.headCell" rdxCalendarHeadCell>{{ day }}</th>
                            }
                        </tr>
                    </thead>
                    <tbody [class]="c.body" rdxCalendarGridBody>
                        @for (weekDates of month.weeks; track $index) {
                            <tr class="grid grid-cols-8">
                                <div class="text-muted-foreground flex items-center justify-center text-xs">
                                    {{ getWeekNumber(weekDates[0]) }}
                                </div>
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
```

### Disabled dates

Pass an `isDateDisabled` matcher — a `(date) => boolean` callback run for every rendered date. Disabled
dates are not focusable or selectable. This example disables weekends.

```typescript
import { Component } from '@angular/core';
import { CalendarDate, DateValue, isWeekend } from '@internationalized/date';
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
    selector: 'app-calendar-disabled-dates',
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
            #root="rdxCalendarRoot"
            [class]="c.root"
            [value]="date"
            [isDateDisabled]="isDateDisabled"
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

            <table [class]="c.grid" rdxCalendarGrid>
                @for (month of root.months(); track $index) {
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
                }
            </table>
        </div>
    `
})
export class CalendarDisabledDates {
    date: DateValue = new CalendarDate(2024, 10, 3);

    /** Disable weekends — the matcher runs for every rendered date. */
    readonly isDateDisabled = (date: DateValue): boolean => isWeekend(date, 'en-US');

    protected readonly cn = cn;
    protected readonly c = demoCalendar;
}
```

### Unavailable dates

`isDateUnavailable` is a `(date) => boolean` callback that marks dates as present-but-not-selectable
(e.g. already booked). They render struck-through and ignore pointer interaction.

```typescript
import { Component } from '@angular/core';
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
    selector: 'app-calendar-unavailable-dates',
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
            #root="rdxCalendarRoot"
            [class]="c.root"
            [value]="date"
            [isDateUnavailable]="isDateUnavailable"
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

            <table [class]="c.grid" rdxCalendarGrid>
                @for (month of root.months(); track $index) {
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
                }
            </table>
        </div>
    `
})
export class CalendarUnavailableDates {
    date: DateValue = new CalendarDate(2024, 10, 3);

    /** Mark the 10th–14th as unavailable: rendered struck-through and not selectable. */
    readonly isDateUnavailable = (date: DateValue): boolean => date.day >= 10 && date.day <= 14;

    protected readonly cn = cn;
    protected readonly c = demoCalendar;
}
```

### Custom navigation

Override how the previous/next buttons move the view with `propsPrevPage` / `propsNextPage` — each a
`(placeholder) => DateValue` callback. This example jumps a whole year per click.

```typescript
import { Component } from '@angular/core';
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
    selector: 'app-calendar-custom-navigation',
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
            #root="rdxCalendarRoot"
            [class]="c.root"
            [value]="date"
            [propsNextPage]="nextYear"
            [propsPrevPage]="prevYear"
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

            <table [class]="c.grid" rdxCalendarGrid>
                @for (month of root.months(); track $index) {
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
                }
            </table>
        </div>
    `
})
export class CalendarCustomNavigation {
    date: DateValue = new CalendarDate(2024, 10, 3);

    /** The prev/next buttons jump a whole year instead of a month. */
    readonly nextYear = (placeholder: DateValue): DateValue => placeholder.add({ years: 1 });
    readonly prevYear = (placeholder: DateValue): DateValue => placeholder.subtract({ years: 1 });

    protected readonly cn = cn;
    protected readonly c = demoCalendar;
}
```

### Multiple months

Set `numberOfMonths` to render several months at once. Arrow-key navigation flows across the page
boundary between months, and (without `pagedNavigation`) the prev/next buttons shift the view by one month.

```typescript
import { Component } from '@angular/core';
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

## Accessibility

### Keyboard Interactions

| Key                                                  | Description                                                                                               |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Tab`                                                | When focus moves onto the calendar, focuses the first navigation button.                                  |
| `Space` / `Enter`                                    | When focus is on `CalendarNext` or `CalendarPrev`, navigates the calendar. Otherwise, selects the date.   |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | When focus is on `CalendarCellTrigger`, navigates the dates, changing the month/year/decade if necessary. |
