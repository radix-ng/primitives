import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Time } from '@internationalized/date';
import { Granularity, HourCycle, TimeValue } from '@radix-ng/primitives/core';
import { RdxTimeFieldInputDirective } from '../src/time-field-input.directive';
import { RdxTimeFieldRootDirective } from '../src/time-field-root.directive';

@Component({
    template: `
        <div
            #root="rdxTimeFieldRoot"
            [granularity]="granularity()"
            [hourCycle]="hourCycle()"
            [value]="value()"
            rdxTimeFieldRoot
        >
            @for (item of root.segmentContents(); track $index) {
                <div [part]="item.part" rdxTimeFieldInput>{{ item.value }}</div>
            }
        </div>
    `,
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective]
})
class TimeFieldHost {
    readonly granularity = signal<Granularity | undefined>(undefined);
    readonly hourCycle = signal<HourCycle>(undefined);
    readonly value = signal<TimeValue | undefined>(undefined);
}

function arrowKey(code: 'ArrowLeft' | 'ArrowRight'): KeyboardEvent {
    return new KeyboardEvent('keydown', { key: code, code, bubbles: true });
}

function segments(fixture: ComponentFixture<TimeFieldHost>): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll<HTMLElement>('[data-rdx-date-field-segment]')).filter(
        (el) => el.getAttribute('data-rdx-date-field-segment') !== 'literal'
    );
}

describe('Time Field', () => {
    let fixture: ComponentFixture<TimeFieldHost>;
    let host: TimeFieldHost;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TimeFieldHost] });
        fixture = TestBed.createComponent(TimeFieldHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('renders hour, minute and day-period segments by default (en is a 12-hour locale)', () => {
        const parts = segments(fixture).map((el) => el.getAttribute('data-rdx-date-field-segment'));
        expect(parts).toEqual(['hour', 'minute', 'dayPeriod']);
    });

    it('moves focus between segments with arrow keys', () => {
        const [hour, minute] = segments(fixture);

        hour.focus();
        expect(document.activeElement).toBe(hour);

        hour.dispatchEvent(arrowKey('ArrowRight'));
        expect(document.activeElement).toBe(minute);

        minute.dispatchEvent(arrowKey('ArrowLeft'));
        expect(document.activeElement).toBe(hour);
    });

    it('keeps navigation in sync when granularity adds a segment after init', () => {
        host.granularity.set('second');
        fixture.detectChanges();

        const parts = segments(fixture).map((el) => el.getAttribute('data-rdx-date-field-segment'));
        expect(parts).toEqual(['hour', 'minute', 'second', 'dayPeriod']);

        // the segment added after the initial render must be reachable by keyboard
        const [, minute, second] = segments(fixture);
        minute.focus();
        minute.dispatchEvent(arrowKey('ArrowRight'));
        expect(document.activeElement).toBe(second);
    });

    it('reflects a controlled value set after initialization', () => {
        const hourBefore = segments(fixture)[0];
        expect(hourBefore.getAttribute('aria-valuetext')).toBe('Empty');

        host.value.set(new Time(10, 30));
        fixture.detectChanges();

        const hourAfter = segments(fixture)[0];
        expect(hourAfter.getAttribute('aria-valuetext')).not.toBe('Empty');
        expect(hourAfter.getAttribute('aria-valuenow')).toBe('10');
    });

    it('re-formats segments when the hour cycle changes', () => {
        host.hourCycle.set(24);
        fixture.detectChanges();
        expect(segments(fixture).some((el) => el.getAttribute('data-rdx-date-field-segment') === 'dayPeriod')).toBe(
            false
        );

        host.hourCycle.set(12);
        fixture.detectChanges();
        expect(segments(fixture).some((el) => el.getAttribute('data-rdx-date-field-segment') === 'dayPeriod')).toBe(
            true
        );
    });
});
