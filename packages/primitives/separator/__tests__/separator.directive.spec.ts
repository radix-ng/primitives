import { Orientation, RdxSeparatorRootDirective } from '../src/separator.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: '<div rdxSeparatorRoot [orientation]="orientation"></div>',
    imports: [RdxSeparatorRootDirective]
})
class TestHostComponent {
    orientation: Orientation = 'horizontal';
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: '<span rdxSeparatorRoot></span>',
    imports: [RdxSeparatorRootDirective]
})
class SpanHostComponent {}

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
        expect(element.getAttribute('data-orientation')).toBe('vertical');

        fixture.componentInstance.orientation = 'horizontal';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(element.getAttribute('data-orientation')).toBe('horizontal');
    });

    it('should default data-orientation to horizontal', () => {
        const defaultFixture = TestBed.createComponent(DefaultHostComponent);
        const defaultElement: HTMLElement = defaultFixture.nativeElement.querySelector('div');

        defaultFixture.detectChanges();

        expect(defaultElement.getAttribute('data-orientation')).toBe('horizontal');
    });

    it('should support non-div host elements', () => {
        const spanFixture = TestBed.createComponent(SpanHostComponent);
        const spanElement: HTMLElement = spanFixture.nativeElement.querySelector('span');

        spanFixture.detectChanges();

        expect(spanElement.getAttribute('role')).toBe('separator');
        expect(spanElement.getAttribute('data-orientation')).toBe('horizontal');
    });
});
