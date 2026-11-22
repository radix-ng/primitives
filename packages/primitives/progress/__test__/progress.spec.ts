import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxProgressIndicatorDirective } from '../src/progress-indicator.directive';
import { RdxProgressLabelDirective } from '../src/progress-label.directive';
import {
    ProgressAriaValueFormatter,
    ProgressValueFormatter,
    RdxProgressRootDirective
} from '../src/progress-root.directive';
import { RdxProgressTrackDirective } from '../src/progress-track.directive';
import { RdxProgressValueDirective } from '../src/progress-value.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div
            [value]="value"
            [min]="min"
            [max]="max"
            [valueLabel]="valueLabel"
            [locale]="locale"
            [format]="format"
            [getAriaValueText]="getAriaValueText"
            labelId="upload-label"
            valueId="upload-value"
            rdxProgressRoot
        >
            <span rdxProgressLabel>Upload</span>
            <span rdxProgressValue></span>
            <div rdxProgressTrack>
                <div rdxProgressIndicator></div>
            </div>
        </div>
    `,
    imports: [
        RdxProgressRootDirective,
        RdxProgressLabelDirective,
        RdxProgressValueDirective,
        RdxProgressTrackDirective,
        RdxProgressIndicatorDirective
    ]
})
class TestHostComponent {
    value: number | null = 50;
    min = 0;
    max = 100;
    valueLabel: ProgressValueFormatter | undefined = (value, min, max) => `${value - min} of ${max - min} files`;
    locale?: string;
    format?: Intl.NumberFormatOptions;
    getAriaValueText?: ProgressAriaValueFormatter;
}

@Component({
    imports: [RdxProgressRootDirective, RdxProgressLabelDirective],
    template: `
        <span id="external-label">External label</span>
        <div [aria-labelledby]="authoredLabel()" aria-valuetext="Download in progress" rdxProgressRoot>
            @if (visible()) {
                <span [id]="labelId()" rdxProgressLabel>Internal label</span>
            }
        </div>
        <div aria-labelledby="external-label" rdxProgressRoot data-static-label></div>
    `
})
class AuthoredProgressHost {
    readonly visible = signal(false);
    readonly labelId = signal('first-label');
    readonly authoredLabel = signal<string | undefined>('external-label');
}

describe('RdxProgress', () => {
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

        root = fixture.nativeElement.querySelector('[rdxProgressRoot]');
        label = fixture.nativeElement.querySelector('[rdxProgressLabel]');
        value = fixture.nativeElement.querySelector('[rdxProgressValue]');
        track = fixture.nativeElement.querySelector('[rdxProgressTrack]');
        indicator = fixture.nativeElement.querySelector('[rdxProgressIndicator]');
    });

    it('sets accessible relationships and formatted value', () => {
        expect(root.getAttribute('role')).toBe('progressbar');
        expect(root.getAttribute('aria-labelledby')).toBe('upload-label');
        // The value is conveyed via aria-valuenow/aria-valuetext, so the visual value is aria-hidden
        // and the root no longer points aria-describedby at it (Base UI parity).
        expect(root.hasAttribute('aria-describedby')).toBe(false);
        expect(value.getAttribute('aria-hidden')).toBe('true');
        expect(root.getAttribute('aria-valuemin')).toBe('0');
        expect(root.getAttribute('aria-valuemax')).toBe('100');
        expect(root.getAttribute('aria-valuenow')).toBe('50');
        expect(root.getAttribute('aria-valuetext')).toBe('50 of 100 files');
        expect(label.getAttribute('id')).toBe('upload-label');
        expect(value.getAttribute('id')).toBe('upload-value');
        expect(value.textContent).toBe('50 of 100 files');
    });

    it('reflects progressing state on all parts', () => {
        for (const element of [root, label, value, track, indicator]) {
            expect(element.getAttribute('data-progressing')).toBe('');
        }

        expect(indicator.getAttribute('data-percent')).toBe('50');
    });

    it('reflects complete state when value equals max', () => {
        component.value = 100;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.getAttribute('data-complete')).toBe('');
        expect(indicator.getAttribute('data-complete')).toBe('');
        expect(indicator.getAttribute('data-percent')).toBe('100');
    });

    it('reflects indeterminate state for null value', () => {
        component.value = null;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.getAttribute('data-indeterminate')).toBe('');
        // min/max stay present when indeterminate; only aria-valuenow is dropped, and aria-valuetext
        // announces the indeterminate state (Base UI + APG).
        expect(root.getAttribute('aria-valuemin')).toBe('0');
        expect(root.getAttribute('aria-valuemax')).toBe('100');
        expect(root.hasAttribute('aria-valuenow')).toBe(false);
        expect(root.getAttribute('aria-valuetext')).toBe('indeterminate progress');
        expect(value.textContent).toBe('');
        expect(indicator.hasAttribute('data-percent')).toBe(false);
    });

    it('supports custom min and max values', () => {
        component.min = 50;
        component.max = 150;
        component.value = 100;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.getAttribute('aria-valuemin')).toBe('50');
        expect(root.getAttribute('aria-valuemax')).toBe('150');
        expect(root.getAttribute('aria-valuenow')).toBe('100');
        expect(root.getAttribute('aria-valuetext')).toBe('50 of 100 files');
        expect(indicator.getAttribute('data-percent')).toBe('50');
    });

    it('clamps out-of-range values without mutating the input', () => {
        component.value = 200;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(component.value).toBe(200);
        expect(root.getAttribute('aria-valuenow')).toBe('100');
        expect(root.getAttribute('data-complete')).toBe('');
    });

    it.each([NaN, Infinity, -Infinity])('treats %s as indeterminate', (nonFinite) => {
        component.value = nonFinite;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.hasAttribute('aria-valuenow')).toBe(false);
        expect(root.getAttribute('aria-valuetext')).toBe('indeterminate progress');
        expect(root.hasAttribute('data-indeterminate')).toBe(true);
        expect(indicator.style.width).toBe('');
    });

    it('normalizes non-finite bounds and keeps a valid zero in the range', () => {
        component.min = -Infinity;
        component.max = Infinity;
        component.value = 0;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.getAttribute('aria-valuemin')).toBe('0');
        expect(root.getAttribute('aria-valuemax')).toBe('100');
        expect(root.getAttribute('aria-valuenow')).toBe('0');
        expect(indicator.getAttribute('data-percent')).toBe('0');
        expect(indicator.style.width).toBe('0%');
    });

    it('keeps an ascending finite range after invalid updates', () => {
        component.min = 50;
        component.max = 30;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(root.getAttribute('aria-valuemin')).toBe('50');
        expect(root.getAttribute('aria-valuemax')).toBe('150');

        component.min = -Number.MAX_VALUE;
        component.max = Number.MAX_VALUE;
        component.value = 0;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(indicator.getAttribute('data-percent')).toBe('50');
        expect(indicator.style.width).toBe('50%');
    });

    it('formats visible clamped text separately from the raw value used for ARIA', () => {
        component.value = 125;
        component.valueLabel = undefined;
        component.locale = 'de-DE';
        component.format = { minimumFractionDigits: 1 };
        component.getAriaValueText = (text, raw) => (raw === null ? 'Waiting' : `${text} of ${raw} files`);
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(value.textContent).toBe('100,0');
        expect(root.getAttribute('aria-valuetext')).toBe('100,0 of 125 files');

        component.value = null;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(value.textContent).toBe('');
        expect(root.getAttribute('aria-valuetext')).toBe('Waiting');
    });
});

it('preserves authored ARIA and follows the mounted label when the authored name is cleared', () => {
    const fixture = TestBed.createComponent(AuthoredProgressHost);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[rdxProgressRoot]') as HTMLElement;
    const host = fixture.componentInstance;
    expect(root.getAttribute('aria-labelledby')).toBe('external-label');
    expect(root.getAttribute('aria-valuetext')).toBe('Download in progress');
    const staticRoot = fixture.nativeElement.querySelector('[data-static-label]') as HTMLElement;
    expect(staticRoot.getAttribute('aria-labelledby')).toBe('external-label');

    host.visible.set(true);
    fixture.detectChanges();
    expect(root.getAttribute('aria-labelledby')).toBe('external-label');

    host.authoredLabel.set(undefined);
    fixture.detectChanges();
    expect(root.getAttribute('aria-labelledby')).toBe('first-label');

    host.labelId.set('next-label');
    fixture.detectChanges();
    expect(root.getAttribute('aria-labelledby')).toBe('next-label');

    host.visible.set(false);
    fixture.detectChanges();
    expect(root.hasAttribute('aria-labelledby')).toBe(false);
});
