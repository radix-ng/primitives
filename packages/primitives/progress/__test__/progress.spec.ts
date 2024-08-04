import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxProgressIndicatorDirective } from '../src/progress-indicator.directive';
import { RdxProgressRootDirective } from '../src/progress-root.directive';

@Component({
    template: `
        <div [rdxValue]="value" [rdxMax]="max" [id]="id" rdxProgressRoot>
            <div rdxProgressIndicator></div>
        </div>
    `
})
class TestHostComponent {
    value: number | null | undefined = 50;
    max = 100;
    id = 'test-progress';
}

describe('RdxProgress', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RdxProgressRootDirective, RdxProgressIndicatorDirective],
            declarations: [TestHostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should set the correct aria attributes and data attributes', () => {
        const progressElement: HTMLElement = fixture.nativeElement.querySelector('div[role="progressbar"]');

        expect(progressElement.getAttribute('aria-valuemax')).toBe('100');
        expect(progressElement.getAttribute('aria-valuemin')).toBe('0');
        expect(progressElement.getAttribute('aria-valuenow')).toBe('50');
        expect(progressElement.getAttribute('aria-valuetext')).toBe('50%');
        expect(progressElement.getAttribute('data-state')).toBe('loading');
        expect(progressElement.getAttribute('data-value')).toBe('50');
        expect(progressElement.getAttribute('data-max')).toBe('100');
        expect(progressElement.id).toBe('test-progress');
    });

    it('should show complete state when value equals max', () => {
        component.value = 100;
        fixture.detectChanges();

        const progressElement: HTMLElement = fixture.nativeElement.querySelector('div[role="progressbar"]');

        expect(progressElement.getAttribute('data-state')).toBe('complete');
    });
});
