import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
            labelId="storage-label"
            valueId="storage-value"
            rdxMeterRoot
        >
            <span rdxMeterLabel>Storage</span>
            <span rdxMeterValue></span>
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

    it('sets accessible relationships and formatted value', () => {
        expect(root.getAttribute('role')).toBe('meter');
        expect(root.getAttribute('aria-labelledby')).toBe('storage-label');
        expect(root.getAttribute('aria-describedby')).toBe('storage-value');
        expect(root.getAttribute('aria-valuemin')).toBe('0');
        expect(root.getAttribute('aria-valuemax')).toBe('100');
        expect(root.getAttribute('aria-valuenow')).toBe('24');
        expect(root.getAttribute('aria-valuetext')).toBe('24% used (24 GB)');
        expect(label.getAttribute('id')).toBe('storage-label');
        expect(value.getAttribute('id')).toBe('storage-value');
        expect(value.textContent).toBe('24%');
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
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.getAttribute('aria-valuemin')).toBe('500');
        expect(root.getAttribute('aria-valuemax')).toBe('1000');
        expect(root.getAttribute('aria-valuenow')).toBe('750');
        expect(indicator.getAttribute('data-percent')).toBe('50');
        expect(value.textContent).toBe('750');
    });

    it('uses explicit ariaValueText over getAriaValueText', () => {
        component.ariaValueText = 'Twenty four gigabytes used';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.getAttribute('aria-valuetext')).toBe('Twenty four gigabytes used');
    });

    it('clamps out-of-range values without mutating the input', () => {
        component.value = 200;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(component.value).toBe(200);
        expect(root.getAttribute('aria-valuenow')).toBe('100');
        expect(indicator.getAttribute('data-percent')).toBe('100');
    });
});
