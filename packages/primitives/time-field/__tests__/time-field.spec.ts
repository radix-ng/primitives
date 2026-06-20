import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Time } from '@internationalized/date';
import { Granularity, HourCycle, TimeValue } from '@radix-ng/primitives/core';
import { RdxTimeFieldInputDirective } from '../src/time-field-input.directive';
import { RdxTimeFieldRootDirective } from '../src/time-field-root.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div
            #root="rdxTimeFieldRoot"
            [(value)]="value"
            [granularity]="granularity()"
            [hourCycle]="hourCycle()"
            [placeholder]="placeholder()"
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
    readonly placeholder = signal<TimeValue | undefined>(undefined);
}

function arrowKey(code: 'ArrowLeft' | 'ArrowRight'): KeyboardEvent {
    return new KeyboardEvent('keydown', { key: code, code, bubbles: true });
}

function key(k: string): KeyboardEvent {
    return new KeyboardEvent('keydown', { key: k, code: k, bubbles: true });
}

/** Type a sequence of single-char keys into a segment element. */
function type(el: HTMLElement, keys: string): void {
    for (const k of keys) el.dispatchEvent(key(k));
}

function rootDirective(fixture: ComponentFixture<TimeFieldHost>): RdxTimeFieldRootDirective {
    return fixture.debugElement.query(By.directive(RdxTimeFieldRootDirective)).injector.get(RdxTimeFieldRootDirective);
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

    describe('segment editing propagates to the public value model', () => {
        it('commits a typed 12-hour time back to `value`', () => {
            const [hour, minute] = segments(fixture);

            type(hour, '9');
            type(minute, '30');
            fixture.detectChanges();

            const value = rootDirective(fixture).value() as Time | undefined;
            expect(value).toBeInstanceOf(Time);
            expect(value?.hour).toBe(9);
            expect(value?.minute).toBe(30);
        });

        it('typing the hour keeps AM (no day-period flip) and converts to 24h on PM toggle', () => {
            const [hour, minute, dayPeriod] = segments(fixture);

            type(hour, '9');
            type(minute, '30');
            fixture.detectChanges();
            // typing 9 must NOT force PM
            expect((rootDirective(fixture).value() as Time)?.hour).toBe(9);

            // toggling to PM re-anchors the canonical hour to 21 (9 PM)
            dayPeriod.dispatchEvent(key('p'));
            fixture.detectChanges();

            const value = rootDirective(fixture).value() as Time;
            expect(value.hour).toBe(21);
            expect(value.minute).toBe(30);
        });

        it('commits a valid two-digit 24-hour time', () => {
            host.hourCycle.set(24);
            fixture.detectChanges();

            const [hour, minute] = segments(fixture);
            type(hour, '13');
            type(minute, '45');
            fixture.detectChanges();

            const value = rootDirective(fixture).value() as Time;
            expect(value.hour).toBe(13);
            expect(value.minute).toBe(45);
        });

        it('rejects the invalid 24-hour value 24 (max is 23)', () => {
            host.hourCycle.set(24);
            fixture.detectChanges();

            const [hour, minute] = segments(fixture);
            // typing 2 then 4 would be 24 — out of range, so the segment restarts at 4
            type(hour, '24');
            type(minute, '15');
            fixture.detectChanges();

            const value = rootDirective(fixture).value() as Time;
            expect(value.hour).toBe(4);
            expect(value.minute).toBe(15);
        });

        it('reports a typed 0 (not the placeholder) in the hour aria value', () => {
            host.hourCycle.set(24);
            host.placeholder.set(new Time(5, 30));
            fixture.detectChanges();

            const [hour] = segments(fixture);
            type(hour, '0'); // midnight; segment value 0 must not be treated as "empty"
            fixture.detectChanges();

            // with the falsy-zero bug this reported the placeholder's hour (5)
            expect(hour.getAttribute('aria-valuenow')).toBe('0');
        });

        it('toggling AM/PM on an empty hour does not fabricate a value', () => {
            const [hour, , dayPeriod] = segments(fixture);

            dayPeriod.dispatchEvent(key('p'));
            fixture.detectChanges();

            // the hour stays empty (no null - 12 / +12 arithmetic) and nothing is committed
            expect(rootDirective(fixture).value()).toBeUndefined();
            expect(hour.getAttribute('aria-valuetext')).toBe('Empty');
        });
    });
});
