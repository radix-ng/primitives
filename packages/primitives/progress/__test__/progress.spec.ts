import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxProgressIndicatorDirective } from '../src/progress-indicator.directive';
import { RdxProgressLabelDirective } from '../src/progress-label.directive';
import { ProgressValueFormatter, RdxProgressRootDirective } from '../src/progress-root.directive';
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
    valueLabel: ProgressValueFormatter = (value, min, max) => `${value - min} of ${max - min} files`;
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
        expect(root.getAttribute('aria-describedby')).toBe('upload-value');
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
            expect(element.getAttribute('data-state')).toBe('progressing');
            expect(element.getAttribute('data-progressing')).toBe('');
        }

        expect(indicator.getAttribute('data-percent')).toBe('50');
    });

    it('reflects complete state when value equals max', () => {
        component.value = 100;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.getAttribute('data-state')).toBe('complete');
        expect(root.getAttribute('data-complete')).toBe('');
        expect(indicator.getAttribute('data-state')).toBe('complete');
        expect(indicator.getAttribute('data-percent')).toBe('100');
    });

    it('reflects indeterminate state for null value', () => {
        component.value = null;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.getAttribute('data-state')).toBe('indeterminate');
        expect(root.getAttribute('data-indeterminate')).toBe('');
        expect(root.hasAttribute('aria-valuemin')).toBe(false);
        expect(root.hasAttribute('aria-valuemax')).toBe(false);
        expect(root.hasAttribute('aria-valuenow')).toBe(false);
        expect(root.hasAttribute('aria-valuetext')).toBe(false);
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
        expect(root.getAttribute('data-state')).toBe('complete');
    });
});
