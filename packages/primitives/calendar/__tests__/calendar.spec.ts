import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarDate } from '@internationalized/date';
import { userEvent } from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CalendarDefaultComponent } from '../stories/calendar-default.component';

type SetupConfig = {
    modelValue?: CalendarDate;
};

function getSelectedDay(calendar: HTMLElement) {
    return calendar.querySelector<HTMLElement>('[data-selected]') as HTMLElement;
}

function getByTestId(id: string, hostEl: HTMLElement) {
    return hostEl.querySelector<HTMLElement>(`[data-testId=${id}]`)!;
}

describe('Calendar', () => {
    let fixture: ComponentFixture<CalendarDefaultComponent>;
    let component: CalendarDefaultComponent;
    let hostEl: HTMLElement;

    const calendarDate = new CalendarDate(1980, 1, 20);

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
});
