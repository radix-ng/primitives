import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Orientation, RdxSeparatorRootDirective } from '../src/separator.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: '<div rdxSeparatorRoot [orientation]="orientation"></div>',
    imports: [RdxSeparatorRootDirective]
})
class TestHostComponent {
    orientation: Orientation | undefined = 'horizontal';
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: '<hr rdxSeparatorRoot orientation="vertical" />',
    imports: [RdxSeparatorRootDirective]
})
class HrHostComponent {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: '<div rdxSeparatorRoot></div>',
    imports: [RdxSeparatorRootDirective]
})
class DefaultHostComponent {}

describe('SeparatorDirective', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let element: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestHostComponent]
        });
        fixture = TestBed.createComponent(TestHostComponent);
        element = fixture.nativeElement.querySelector('div');
    });

    it('should set default role to "separator"', () => {
        fixture.detectChanges();
        expect(element.getAttribute('role')).toBe('separator');
    });

    it('should set aria-orientation to "horizontal" if orientation is horizontal', () => {
        fixture.componentInstance.orientation = 'horizontal';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(element.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('should set aria-orientation to "vertical" if orientation is vertical', () => {
        fixture.componentInstance.orientation = 'vertical';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(element.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('should set data-orientation based on the orientation input', () => {
        fixture.componentInstance.orientation = 'vertical';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(element.getAttribute('aria-orientation')).toBe('vertical');
        expect(element.getAttribute('data-orientation')).toBe('vertical');

        fixture.componentInstance.orientation = 'horizontal';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(element.getAttribute('aria-orientation')).toBe('horizontal');
        expect(element.getAttribute('data-orientation')).toBe('horizontal');
    });

    it('should default data-orientation to horizontal', () => {
        const defaultFixture = TestBed.createComponent(DefaultHostComponent);
        const defaultElement: HTMLElement = defaultFixture.nativeElement.querySelector('div');

        defaultFixture.detectChanges();

        expect(defaultElement.getAttribute('data-orientation')).toBe('horizontal');
    });

    it('restores the horizontal default when the bound orientation is cleared', () => {
        fixture.componentInstance.orientation = 'vertical';
        fixture.detectChanges();
        expect(element.getAttribute('data-orientation')).toBe('vertical');

        fixture.componentInstance.orientation = undefined;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(element.getAttribute('role')).toBe('separator');
        expect(element.getAttribute('aria-orientation')).toBe('horizontal');
        expect(element.getAttribute('data-orientation')).toBe('horizontal');
    });

    it('supports an authored native horizontal rule with explicit orientation', () => {
        const hrFixture = TestBed.createComponent(HrHostComponent);
        const hr: HTMLElement = hrFixture.nativeElement.querySelector('hr');

        hrFixture.detectChanges();

        expect(hr.getAttribute('role')).toBe('separator');
        expect(hr.getAttribute('aria-orientation')).toBe('vertical');
        expect(hr.getAttribute('data-orientation')).toBe('vertical');
    });
});
