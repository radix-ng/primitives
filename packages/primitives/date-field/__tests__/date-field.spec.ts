import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { CalendarDate, CalendarDateTime, DateValue } from '@internationalized/date';
import { Granularity } from '@radix-ng/primitives/core';
import { RdxDateFieldInputDirective } from '../src/date-field-input.directive';
import { RdxDateFieldRootDirective } from '../src/date-field-root.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div
            #root="rdxDateFieldRoot"
            [granularity]="granularity()"
            [locale]="locale()"
            [value]="value()"
            rdxDateFieldRoot
        >
            @for (item of root.segmentContents(); track $index) {
                <div [part]="item.part" rdxDateFieldInput>{{ item.value }}</div>
            }
        </div>
    `,
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective]
})
class DateFieldHost {
    readonly granularity = signal<Granularity | undefined>(undefined);
    readonly locale = signal<string>('en');
    readonly value = signal<DateValue | undefined>(undefined);
}

function rootDirective(fixture: ComponentFixture<DateFieldHost>): RdxDateFieldRootDirective {
    return fixture.debugElement.query(By.directive(RdxDateFieldRootDirective)).injector.get(RdxDateFieldRootDirective);
}

function arrowKey(code: 'ArrowLeft' | 'ArrowRight'): KeyboardEvent {
    return new KeyboardEvent('keydown', { key: code, code, bubbles: true });
}

function segments(fixture: ComponentFixture<DateFieldHost>): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll<HTMLElement>('[data-rdx-date-field-segment]')).filter(
        (el) => el.getAttribute('data-rdx-date-field-segment') !== 'literal'
    );
}

function parts(fixture: ComponentFixture<DateFieldHost>): (string | null)[] {
    return segments(fixture).map((el) => el.getAttribute('data-rdx-date-field-segment'));
}

describe('Date Field', () => {
    let fixture: ComponentFixture<DateFieldHost>;
    let host: DateFieldHost;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [DateFieldHost] });
        fixture = TestBed.createComponent(DateFieldHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('renders day, month and year segments by default', () => {
        expect(parts(fixture).sort()).toEqual(['day', 'month', 'year']);
    });

    it('moves focus between segments with arrow keys', () => {
        const [first, second] = segments(fixture);

        first.focus();
        first.dispatchEvent(arrowKey('ArrowRight'));
        expect(document.activeElement).toBe(second);

        second.dispatchEvent(arrowKey('ArrowLeft'));
        expect(document.activeElement).toBe(first);
    });

    it('reflects a controlled value set after initialization', () => {
        const yearBefore = segments(fixture).find((el) => el.getAttribute('data-rdx-date-field-segment') === 'year')!;
        expect(yearBefore.getAttribute('aria-valuetext')).toBe('Empty');

        host.value.set(new CalendarDate(2026, 6, 6));
        fixture.detectChanges();

        const yearAfter = segments(fixture).find((el) => el.getAttribute('data-rdx-date-field-segment') === 'year')!;
        expect(yearAfter.getAttribute('aria-valuenow')).toBe('2026');
    });

    it('adds time segments — reachable by keyboard — for a date-time value', () => {
        host.value.set(new CalendarDateTime(2025, 1, 15, 10, 30));
        fixture.detectChanges();

        expect(parts(fixture)).toContain('hour');
        expect(parts(fixture)).toContain('minute');

        // a segment that only appears once the value carries time must join navigation
        const all = segments(fixture);
        const hour = all.find((el) => el.getAttribute('data-rdx-date-field-segment') === 'hour')!;
        const minute = all.find((el) => el.getAttribute('data-rdx-date-field-segment') === 'minute')!;
        hour.focus();
        hour.dispatchEvent(arrowKey('ArrowRight'));
        expect(document.activeElement).toBe(minute);
    });

    it('re-seeds the placeholder calendar when the locale selects a non-Gregorian calendar', () => {
        const root = rootDirective(fixture);
        expect(root.placeholder()?.calendar.identifier).toBe('gregory');

        host.locale.set('en-US-u-ca-buddhist');
        fixture.detectChanges();

        // an empty field must follow the locale's calendar system, not stay Gregorian
        expect(root.placeholder()?.calendar.identifier).toBe('buddhist');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div
            #root="rdxDateFieldRoot"
            [value]="value()"
            [maxValue]="maxValue()"
            [invalid]="invalid()"
            [errors]="errors()"
            [dirty]="dirty()"
            rdxDateFieldRoot
        >
            @for (item of root.segmentContents(); track $index) {
                <div [part]="item.part" rdxDateFieldInput>{{ item.value }}</div>
            }
        </div>
    `,
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective]
})
class DateFieldValidationHost {
    readonly value = signal<DateValue | undefined>(undefined);
    readonly maxValue = signal<DateValue | undefined>(undefined);
    readonly invalid = signal(false);
    readonly dirty = signal(false);
    readonly errors = signal<{ kind: string; message?: string }[]>([]);
}

describe('RdxDateField validation state', () => {
    let fixture: ComponentFixture<DateFieldValidationHost>;
    let host: DateFieldValidationHost;
    let root: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [DateFieldValidationHost] });
        fixture = TestBed.createComponent(DateFieldValidationHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.directive(RdxDateFieldRootDirective)).nativeElement;
    });

    it('is valid by default', () => {
        expect(root.getAttribute('data-valid')).toBe('');
        expect(root.getAttribute('data-invalid')).toBeNull();
        expect(root.getAttribute('aria-invalid')).toBeNull();
    });

    it('reflects the invalid input', () => {
        host.invalid.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(root.getAttribute('aria-invalid')).toBe('true');
    });

    it('is invalid when the errors list is non-empty', () => {
        host.errors.set([{ kind: 'required', message: 'Required.' }]);
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(root.getAttribute('aria-invalid')).toBe('true');
    });

    it('combines with the built-in range check (value after maxValue)', () => {
        host.value.set(new CalendarDate(2030, 1, 1));
        host.maxValue.set(new CalendarDate(2025, 1, 1));
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
    });

    it('reflects the dirty input', () => {
        expect(root.getAttribute('data-dirty')).toBeNull();
        host.dirty.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-dirty')).toBe('');
    });

    it('marks touched on focus-out', () => {
        expect(root.getAttribute('data-touched')).toBeNull();
        root.dispatchEvent(new FocusEvent('focusout'));
        fixture.detectChanges();
        expect(root.getAttribute('data-touched')).toBe('');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div #root="rdxDateFieldRoot" [formField]="date" rdxDateFieldRoot>
            @for (item of root.segmentContents(); track $index) {
                <div [part]="item.part" rdxDateFieldInput>{{ item.value }}</div>
            }
        </div>
    `,
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective, FormField]
})
class DateFieldSignalFormHost {
    readonly model = signal<{ date: DateValue | undefined }>({ date: new CalendarDate(2026, 1, 15) });
    readonly formTree = form(this.model);

    get date() {
        return this.formTree.date;
    }
}

describe('RdxDateField with Signal Forms', () => {
    let fixture: ComponentFixture<DateFieldSignalFormHost>;
    let host: DateFieldSignalFormHost;

    function rootValue(): DateValue | undefined {
        return fixture.debugElement
            .query(By.directive(RdxDateFieldRootDirective))
            .injector.get(RdxDateFieldRootDirective)
            .value();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [DateFieldSignalFormHost] });
        fixture = TestBed.createComponent(DateFieldSignalFormHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('reflects the bound field value (FormValueControl)', () => {
        expect(rootValue()?.toString()).toBe('2026-01-15');
        host.model.update((value) => ({ ...value, date: new CalendarDate(2027, 6, 20) }));
        fixture.detectChanges();
        expect(rootValue()?.toString()).toBe('2027-06-20');
    });
});
