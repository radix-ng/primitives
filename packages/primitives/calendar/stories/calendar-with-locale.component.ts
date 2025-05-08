import { Component, computed, signal } from '@angular/core';
import { CalendarIdentifier, createCalendar, getLocalTimeZone, toCalendar, today } from '@internationalized/date';
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
    selector: 'app-calendar-with-locale',
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
        <div class="wrapper" style="display: flex; flex-direction: column; gap: 1rem;">
            <label style="color: white;">Locale</label>
            <select [value]="locale()" (change)="updateLocale($event)">
                @for (option of preferences; track $index) {
                    <option [value]="option.locale">{{ option.label }}</option>
                }
            </select>

            <label style="color: white;">Calendar</label>
            <select [value]="calendar()">
                @for (option of preferredCalendars(); track $index) {
                    <option [value]="option!.key">{{ option!.name }}</option>
                }
            </select>

            <div
                class="calendar-root"
                #root="rdxCalendarRoot"
                [value]="value()"
                [locale]="locale()"
                rdxCalendarRoot
                fixedWeeks
            >
                <div class="calendar-header" rdxCalendarHeader>
                    <button class="icon-button" type="button" rdxCalendarPrev>
                        <lucide-angular [img]="ChevronLeft" size="16" style="display: flex;" />
                    </button>
                    <div class="calendar-heading" #head="rdxCalendarHeading" rdxCalendarHeading>
                        {{ head.headingValue() }}
                    </div>
                    <button class="icon-button" type="button" rdxCalendarNext>
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
export class CalendarWithLocaleComponent {
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

    readonly otherCalendars = computed(() =>
        this.calendars.filter((c) => !this.preferredCalendars().some((p) => p!.key === c.key))
    );

    readonly value = computed(() =>
        toCalendar(today(getLocalTimeZone()), createCalendar(this.calendar() as CalendarIdentifier))
    );

    updateLocale(event: Event) {
        const newLocale = (event.target as HTMLSelectElement).value;

        this.locale.set(newLocale);
        this.calendar.set(this.pref()!.ordering.split(' ')[0]);
    }

    protected readonly ChevronLeft = ChevronLeft;
    protected readonly ChevronRight = ChevronRight;
}
