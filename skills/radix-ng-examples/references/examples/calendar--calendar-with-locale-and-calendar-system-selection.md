# Calendar — Calendar with Locale and Calendar System Selection

> One example from the [Calendar](../components/calendar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

This example showcases some of the available locales and how the calendar systems are displayed.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CalendarIdentifier, createCalendar, getLocalTimeZone, toCalendar, today } from '@internationalized/date';
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
                <select class="demo-input h-9 w-full px-3" [value]="locale()" (change)="updateLocale($event)">
                    @for (option of preferences; track option.locale) {
                        <option [value]="option.locale">{{ option.label }}</option>
                    }
                </select>
            </label>

            <label class="text-foreground flex flex-col gap-1 text-sm font-medium">
                Calendar
                <select class="demo-input h-9 w-full px-3" [value]="calendar()" (change)="updateCalendar($event)">
                    @for (option of preferredCalendars(); track option!.key) {
                        <option [value]="option!.key">{{ option!.name }}</option>
                    }
                </select>
            </label>

            <div
                class="demo-calendar-root w-[300px] p-4"
                #root="rdxCalendarRoot"
                [value]="value()"
                [locale]="locale()"
                rdxCalendarRoot
                fixedWeeks
            >
                <div class="flex items-center justify-between" rdxCalendarHeader>
                    <button
                        class="demo-button-ghost demo-focus inline-flex size-7 cursor-pointer items-center justify-center rounded-md"
                        type="button"
                        rdxCalendarPrev
                    >
                        <svg lucideChevronLeft size="16" />
                    </button>
                    <div class="demo-label" #head="rdxCalendarHeading" rdxCalendarHeading>
                        {{ head.headingValue() }}
                    </div>
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
