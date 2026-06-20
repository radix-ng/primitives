import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxVisuallyHiddenInputDirective } from '../src/visually-hidden-input.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxVisuallyHiddenInputDirective],
    template: `
        <input [name]="name" [value]="value" [required]="required" rdxVisuallyHiddenInput />
    `
})
class TestComponent {
    name = 'agree';
    value = 'on';
    required = true;
}

describe('RdxVisuallyHiddenInputDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let input: DebugElement;

    beforeEach(() => {
        fixture = TestBed.configureTestingModule({
            imports: [TestComponent]
        }).createComponent(TestComponent);

        component = fixture.componentInstance;
        input = fixture.debugElement.query(By.css('input'));
        fixture.detectChanges();
    });

    it('should forward a single scalar value through the composed bubble', () => {
        // Single source of truth: exactly one name/value pair, no duplicate writers.
        expect(input.nativeElement.getAttribute('name')).toBe('agree');
        expect(input.nativeElement.getAttribute('value')).toBe('on');
        expect(input.nativeElement.value).toBe('on');
        expect(input.nativeElement.getAttribute('required')).toBe('true');
    });

    it('should be fully hidden by default', () => {
        expect(input.nativeElement.getAttribute('aria-hidden')).toBe('true');
        expect(input.nativeElement.hidden).toBe(true);
        expect(input.nativeElement.style.display).toBe('none');
    });

    it('should update the value when the binding changes', () => {
        component.value = 'off';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(input.nativeElement.getAttribute('value')).toBe('off');
        expect(input.nativeElement.value).toBe('off');
    });
});
