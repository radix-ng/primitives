import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Orientation, RdxSeparatorRootDirective } from '../src/separator.directive';

@Component({
    template: '<div rdxSeparatorRoot [orientation]="orientation" [decorative]="decorative"></div>',
    imports: [RdxSeparatorRootDirective]
})
class TestHostComponent {
    orientation: Orientation = 'horizontal';
    decorative = false;
}

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

    it('should set role to "none" if decorative is true', () => {
        fixture.componentInstance.decorative = true;
        fixture.detectChanges();
        expect(element.getAttribute('role')).toBe('none');
    });

    it('should not set aria-orientation if orientation is horizontal', () => {
        fixture.componentInstance.orientation = 'horizontal';
        fixture.detectChanges();
        expect(element.getAttribute('aria-orientation')).toBeNull();
    });

    it('should set aria-orientation to "vertical" if orientation is vertical and decorative is false', () => {
        fixture.componentInstance.orientation = 'vertical';
        fixture.detectChanges();
        expect(element.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('should not set aria-orientation if decorative is true', () => {
        fixture.componentInstance.orientation = 'vertical';
        fixture.componentInstance.decorative = true;
        fixture.detectChanges();
        expect(element.getAttribute('aria-orientation')).toBeNull();
    });

    it('should set data-orientation based on the orientation input', () => {
        fixture.componentInstance.orientation = 'vertical';
        fixture.detectChanges();
        expect(element.getAttribute('data-orientation')).toBe('vertical');

        fixture.componentInstance.orientation = 'horizontal';
        fixture.detectChanges();
        expect(element.getAttribute('data-orientation')).toBe('horizontal');
    });
});
