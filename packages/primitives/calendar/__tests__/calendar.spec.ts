import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarDate, CalendarDateTime, DateValue, toZoned } from '@internationalized/date';
import { userEvent } from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CalendarDefault } from '../stories/calendar-default';

type SetupConfig = {
    modelValue?: DateValue;
    prevPage?: (placeholder: DateValue) => DateValue;
};

function getSelectedDay(calendar: HTMLElement) {
    return calendar.querySelector<HTMLElement>('[data-selected]') as HTMLElement;
}

function getHeading(hostEl: HTMLElement) {
    return hostEl.querySelector<HTMLElement>('[rdxCalendarHeading]')!;
}

function getNextButton(hostEl: HTMLElement) {
    return hostEl.querySelector<HTMLElement>('[rdxCalendarNext]')!;
}

const calendarDate = new CalendarDate(1980, 1, 20);
const calendarDateTime = new CalendarDateTime(1980, 1, 20, 12, 30, 0, 0);
const zonedDateTime = toZoned(calendarDateTime, 'America/New_York');

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

describe('Calendar', () => {
    let fixture: ComponentFixture<CalendarDefault>;
    let component: CalendarDefault;
    let hostEl: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CalendarDefault]
        }).compileComponents();

        fixture = TestBed.createComponent(CalendarDefault);
        component = fixture.componentInstance;
        hostEl = fixture.nativeElement;
    });

    async function setup({ modelValue }: SetupConfig = {}) {
        if (modelValue !== undefined) {
            component.date = modelValue;
        }

        fixture.detectChanges();

        const user = userEvent.setup();

        const calendar = hostEl.querySelector<HTMLElement>('[rdxCalendarRoot]')!;
        expect(calendar).toBeTruthy();

        return { fixture, component, hostEl, calendar, user };
    }

    it('should pass axe accessibility tests', async () => {
        const { calendar } = await setup({ modelValue: calendarDate });

        expect(await axe(calendar)).toHaveNoViolations();
    });

    it('respects a default value if provided - `CalendarDate`', async () => {
        const { calendar } = await setup({ modelValue: calendarDate });
        expect(getSelectedDay(calendar)).toHaveTextContent(String(calendarDate.day));
        expect(getHeading(hostEl)).toHaveTextContent('January 1980');
    });

    it('respects a default value if provided - `CalendarDateTime`', async () => {
        const { calendar } = await setup({ modelValue: calendarDateTime });

        expect(getSelectedDay(calendar)).toHaveTextContent(String(calendarDateTime.day));
        expect(getHeading(hostEl)).toHaveTextContent('January 1980');
    });

    it('respects a default value if provided - `ZonedDateTime`', async () => {
        const { calendar } = await setup({ modelValue: zonedDateTime });

        expect(getSelectedDay(calendar)).toHaveTextContent(String(zonedDateTime.day));
        expect(getHeading(hostEl)).toHaveTextContent('January 1980');
    });

    it('navigates the months forward using the next button', async () => {
        const { user } = await setup({ modelValue: calendarDate });

        const heading = getHeading(hostEl);
        const nextBtn = getNextButton(hostEl);

        for (const month of months) {
            expect(heading).toHaveTextContent(`${month} 1980`);
            await user.click(nextBtn);
            fixture.detectChanges();
        }
        expect(heading).toHaveTextContent('January 1981');
    });
});
