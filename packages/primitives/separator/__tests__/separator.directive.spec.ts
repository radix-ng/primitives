import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Orientation, RdxSeparatorRootDirective } from '../src/separator.directive';

@Component({
    template: '<div SeparatorRoot [rdxOrientation]="orientation" [rdxDecorative]="decorative"></div>'
})
class TestComponent {
    orientation: Orientation = 'horizontal';
    decorative = false;
}

describe('SeparatorDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let div: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TestComponent],
            imports: [RdxSeparatorRootDirective]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        div = fixture.debugElement.query(By.css('div'));
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        const directive = new RdxSeparatorRootDirective();
        expect(directive).toBeTruthy();
    });

    it('should apply the correct role attribute based on decorative input', () => {
        expect(div.nativeElement.getAttribute('role')).toBe('separator');
        component.decorative = true;
        fixture.detectChanges();
        expect(div.nativeElement.getAttribute('role')).toBe('none');
    });

    it('should apply the correct aria-orientation attribute based on orientation input', () => {
        expect(div.nativeElement.getAttribute('aria-orientation')).toBe(null);
        component.orientation = 'vertical';
        fixture.detectChanges();
        expect(div.nativeElement.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('should apply the correct data-orientation attribute based on orientation input', () => {
        expect(div.nativeElement.getAttribute('data-orientation')).toBe('horizontal');
        component.orientation = 'vertical';
        fixture.detectChanges();
        expect(div.nativeElement.getAttribute('data-orientation')).toBe('vertical');
    });
});
