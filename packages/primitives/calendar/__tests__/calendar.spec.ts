import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarDate, CalendarDateTime, DateValue, toZoned } from '@internationalized/date';
import { userEvent } from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CalendarDefaultComponent } from '../stories/calendar-default.component';

type SetupConfig = {
    modelValue?: DateValue;
    prevPage?: (placeholder: DateValue) => DateValue;
};

function getSelectedDay(calendar: HTMLElement) {
    return calendar.querySelector<HTMLElement>('[data-selected]') as HTMLElement;
}

function getByTestId(id: string, hostEl: HTMLElement) {
    return hostEl.querySelector<HTMLElement>(`[data-testId=${id}]`)!;
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
    let fixture: ComponentFixture<CalendarDefaultComponent>;
    let component: CalendarDefaultComponent;
    let hostEl: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CalendarDefaultComponent
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CalendarDefaultComponent);
        component = fixture.componentInstance;
        hostEl = fixture.nativeElement;
    });

    async function setup({ modelValue }: SetupConfig = {}) {
        if (modelValue !== undefined) {
            component.date = modelValue;
        }

        fixture.detectChanges();

        const user = userEvent.setup();

        const calendar = hostEl.querySelector<HTMLElement>('[data-testId="calendar"]')!;
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
        expect(getByTestId('heading', hostEl)).toHaveTextContent('January 1980');
    });

    it('respects a default value if provided - `CalendarDateTime`', async () => {
        const { calendar } = await setup({ modelValue: calendarDateTime });

        expect(getSelectedDay(calendar)).toHaveTextContent(String(calendarDateTime.day));
        expect(getByTestId('heading', hostEl)).toHaveTextContent('January 1980');
    });

    it('respects a default value if provided - `ZonedDateTime`', async () => {
        const { calendar } = await setup({ modelValue: zonedDateTime });

        expect(getSelectedDay(calendar)).toHaveTextContent(String(zonedDateTime.day));
        expect(getByTestId('heading', hostEl)).toHaveTextContent('January 1980');
    });

    it('navigates the months forward using the next button', async () => {
        const { user } = await setup({ modelValue: calendarDate });

        const heading = getByTestId('heading', hostEl);
        const nextBtn = getByTestId('next-button', hostEl);

        for (const month of months) {
            expect(heading).toHaveTextContent(`${month} 1980`);
            await user.click(nextBtn);
            fixture.detectChanges();
        }
        expect(heading).toHaveTextContent('January 1981');
    });
});
