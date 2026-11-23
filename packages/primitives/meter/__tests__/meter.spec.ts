import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { RdxMeterIndicatorDirective } from '../src/meter-indicator.directive';
import { RdxMeterLabelDirective } from '../src/meter-label.directive';
import { MeterValueFormatter, RdxMeterRootDirective } from '../src/meter-root.directive';
import { RdxMeterTrackDirective } from '../src/meter-track.directive';
import { RdxMeterValueDirective } from '../src/meter-value.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div
            [value]="value"
            [min]="min"
            [max]="max"
            [locale]="locale"
            [format]="format"
            [aria-valuetext]="ariaValueText"
            [getAriaValueText]="getAriaValueText"
            [aria-labelledby]="labelledBy"
            labelId="storage-label"
            valueId="storage-value"
            rdxMeterRoot
            aria-label="Fallback storage"
        >
            @if (showLabel) {
                <span [id]="labelId" rdxMeterLabel>Storage</span>
            }
            <span [getValueText]="getValueText" rdxMeterValue></span>
            <div rdxMeterTrack>
                <div rdxMeterIndicator></div>
            </div>
        </div>
    `,
    imports: [
        RdxMeterRootDirective,
        RdxMeterLabelDirective,
        RdxMeterValueDirective,
        RdxMeterTrackDirective,
        RdxMeterIndicatorDirective
    ]
})
class TestHostComponent {
    value = 24;
    min = 0;
    max = 100;
    locale: Intl.LocalesArgument = 'en-US';
    format: Intl.NumberFormatOptions | undefined;
    ariaValueText: string | undefined;
    labelledBy: string | undefined;
    labelId: string | undefined;
    showLabel = true;
    getValueText: MeterValueFormatter | undefined;
    getAriaValueText: MeterValueFormatter | undefined = (formattedValue, value) =>
        `${formattedValue} used (${value} GB)`;
}

describe('RdxMeter', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;
    let root: HTMLElement;
    let label: HTMLElement;
    let value: HTMLElement;
    let track: HTMLElement;
    let indicator: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestHostComponent]
        });

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        root = fixture.nativeElement.querySelector('[rdxMeterRoot]');
        label = fixture.nativeElement.querySelector('[rdxMeterLabel]');
        value = fixture.nativeElement.querySelector('[rdxMeterValue]');
        track = fixture.nativeElement.querySelector('[rdxMeterTrack]');
        indicator = fixture.nativeElement.querySelector('[rdxMeterIndicator]');
    });

    function render() {
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
    }

    it('[WCAG 4.1.2] sets accessible relationships and formatted value', async () => {
        expect(root.getAttribute('role')).toBe('meter');
        expect(root.getAttribute('aria-labelledby')).toBe('storage-label');
        expect(root).not.toHaveAttribute('aria-describedby');
        expect(root.getAttribute('aria-valuemin')).toBe('0');
        expect(root.getAttribute('aria-valuemax')).toBe('100');
        expect(root.getAttribute('aria-valuenow')).toBe('24');
        expect(root.getAttribute('aria-valuetext')).toBe('24% used (24 GB)');
        expect(label.getAttribute('id')).toBe('storage-label');
        expect(value.getAttribute('id')).toBe('storage-value');
        expect(value).toHaveAttribute('aria-hidden', 'true');
        expect(value.textContent).toBe('24%');
        expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('reflects value metadata on all visual parts', () => {
        for (const element of [root, value, track, indicator]) {
            expect(element.getAttribute('data-value')).toBe('24');
            expect(element.getAttribute('data-min')).toBe('0');
            expect(element.getAttribute('data-max')).toBe('100');
            expect(element.getAttribute('data-percent')).toBe('24');
        }
    });

    it('supports custom min and max values', () => {
        component.value = 750;
        component.min = 500;
        component.max = 1000;
        component.format = {};
        render();

        expect(root.getAttribute('aria-valuemin')).toBe('500');
        expect(root.getAttribute('aria-valuemax')).toBe('1000');
        expect(root.getAttribute('aria-valuenow')).toBe('750');
        expect(indicator.getAttribute('data-percent')).toBe('50');
        expect(value.textContent).toBe('750');
    });

    it('uses explicit ariaValueText over getAriaValueText', () => {
        component.ariaValueText = 'Twenty four gigabytes used';
        render();

        expect(root.getAttribute('aria-valuetext')).toBe('Twenty four gigabytes used');
    });

    it('clamps out-of-range values without mutating the input', () => {
        component.value = 200;
        render();

        expect(component.value).toBe(200);
        expect(root.getAttribute('aria-valuenow')).toBe('100');
        expect(indicator.getAttribute('data-percent')).toBe('100');
        expect(root).toHaveAttribute('aria-valuetext', '100% used (200 GB)');
    });

    it('formats the default accessible value while allowing custom visible text', () => {
        component.value = 250;
        component.locale = 'de-DE';
        component.format = { minimumFractionDigits: 1 };
        component.getAriaValueText = undefined;
        component.getValueText = (formatted, raw) => formatted + ' / ' + raw;
        render();

        expect(root).toHaveAttribute('aria-valuetext', '100,0');
        expect(value).toHaveTextContent('100,0 / 250');
    });

    it('[WCAG 4.1.2] updates the label relationship when the ID or mounted label changes', () => {
        component.labelId = 'live-storage';
        component.labelledBy = 'authored-storage';
        render();
        expect(label).toHaveAttribute('id', 'live-storage');
        expect(root).toHaveAttribute('aria-labelledby', 'authored-storage');

        component.labelledBy = undefined;
        render();
        expect(root).toHaveAttribute('aria-labelledby', 'live-storage');

        component.showLabel = false;
        render();
        expect(root).not.toHaveAttribute('aria-labelledby');

        component.showLabel = true;
        render();
        expect(root).toHaveAttribute('aria-labelledby', 'live-storage');
    });

    it.each([
        { value: 5, min: 5, max: 5, range: [5, 5], now: 5, percent: 0 },
        { value: 6, min: 5, max: 5, range: [5, 5], now: 5, percent: 100 },
        { value: NaN, min: 10, max: 110, range: [10, 110], now: 10, percent: 0 },
        { value: Infinity, min: 10, max: 110, range: [10, 110], now: 110, percent: 100 },
        { value: -Infinity, min: 10, max: 110, range: [10, 110], now: 10, percent: 0 },
        { value: Infinity, min: Infinity, max: Infinity, range: [0, 100], now: 100, percent: 100 },
        { value: 30, min: 10, max: 5, range: [10, 110], now: 30, percent: 20 },
        {
            value: 0,
            min: -Number.MAX_VALUE,
            max: Number.MAX_VALUE,
            range: [-Number.MAX_VALUE, Number.MAX_VALUE],
            now: 0,
            percent: 50
        },
        { value: 40, min: Number.MAX_VALUE, max: NaN, range: [0, 100], now: 40, percent: 40 }
    ])(
        'keeps ARIA and the fill in sync for $value in [$min, $max]',
        ({ value: inputValue, min, max, range, now, percent }) => {
            component.value = inputValue;
            component.min = min;
            component.max = max;
            component.getAriaValueText = undefined;
            render();

            expect(root).toHaveAttribute('aria-valuemin', String(range[0]));
            expect(root).toHaveAttribute('aria-valuemax', String(range[1]));
            expect(root).toHaveAttribute('aria-valuenow', String(now));
            expect(root).toHaveAttribute('aria-valuetext', percent + '%');
            expect(indicator).toHaveAttribute('data-percent', String(percent));
        }
    );
});
