# Calendar — Calendar with Locale and Calendar System Selection

> One example from the [Calendar](../components/calendar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

This example showcases some of the available locales and how the calendar systems are displayed.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
