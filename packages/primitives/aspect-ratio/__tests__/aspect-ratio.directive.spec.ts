import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxAspectRatioDirective } from '../src/aspect-ratio.directive';

@Component({
    template: `
        <div [ratio]="ratio" rdxAspectRatio></div>
    `,
    imports: [RdxAspectRatioDirective]
})
class TestComponent {
    ratio = 16 / 9;
}

describe('AspectRatioDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;

    beforeEach(() => {
        fixture = TestBed.configureTestingModule({
            imports: [TestComponent]
        }).createComponent(TestComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should set paddingBottom correctly with rounded value', () => {
        const div: HTMLElement = fixture.nativeElement.querySelector('div');

        // 1 / (16/9) * 100 = 56.25%
        expect(div.style.paddingBottom).toBe('56.25%');
    });

    it('should set position to relative and width to 100%', () => {
        const div: HTMLElement = fixture.nativeElement.querySelector('div');

        expect(div.style.position).toBe('relative');
        expect(div.style.width).toBe('100%');
    });

    it('should update paddingBottom when ratio changes', () => {
        const div: HTMLElement = fixture.nativeElement.querySelector('div');

        component.ratio = 4 / 3;
        fixture.detectChanges();

        // 1 / (4/3) * 100 = 75%
        expect(div.style.paddingBottom).toBe('75%');
    });

    it('should set paddingBottom correctly for small ratios', () => {
        const div: HTMLElement = fixture.nativeElement.querySelector('div');

        component.ratio = 1 / 1;
        fixture.detectChanges();

        // 1 / (1/1) * 100 = 100%
        expect(div.style.paddingBottom).toBe('100%'); //
    });

    it('should set paddingBottom to 0% when ratio is 0 to avoid division by zero', () => {
        const div: HTMLElement = fixture.nativeElement.querySelector('div');

        component.ratio = 0;
        fixture.detectChanges();

        expect(div.style.paddingBottom).toBe('0%');
    });
});
