import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RdxToggleDirective } from '../src/toggle.directive';

@Component({
    imports: [RdxToggleDirective],
    template:
        '<button rdxToggle [pressed]="pressed" [disabled]="disabled" (onPressedChange)="onToggle($event)">Toggle</button>'
})
class TestComponent {
    @Input() pressed = false;
    @Input() disabled = false;

    onToggle(pressed: boolean) {
        this.pressed = pressed;
    }
}

@Component({
    imports: [RdxToggleDirective, ReactiveFormsModule],
    template: `
        <button [formControl]="toggleControl" rdxToggle>Toggle</button>
    `
})
class ReactiveFormTestComponent {
    toggleControl = new FormControl(false);
}

describe('RdxToggleDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let button: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        button = fixture.debugElement.query(By.css('button'));
        fixture.detectChanges();
    });

    it('should initialize with default values', () => {
        expect(component.pressed).toBe(false);
        expect(component.disabled).toBe(false);
    });

    it('should apply the correct aria-pressed attribute', () => {
        expect(button.nativeElement.getAttribute('aria-pressed')).toBe('false');
        component.pressed = true;
        fixture.detectChanges();
        expect(button.nativeElement.getAttribute('aria-pressed')).toBe('true');
    });

    it('should apply the correct data-state attribute', () => {
        expect(button.nativeElement.getAttribute('data-state')).toBe('off');
        component.pressed = true;
        fixture.detectChanges();
        expect(button.nativeElement.getAttribute('data-state')).toBe('on');
    });

    it('should apply the correct data-disabled attribute', () => {
        expect(button.nativeElement.getAttribute('data-disabled')).toBe(null);
        component.disabled = true;
        fixture.detectChanges();
        expect(button.nativeElement.getAttribute('data-disabled')).toBe('');
    });

    it('should toggle the pressed state on click', () => {
        expect(component.pressed).toBe(false);
        button.nativeElement.click();
        fixture.detectChanges();
        expect(component.pressed).toBe(true);
        button.nativeElement.click();
        expect(component.pressed).toBe(false);
    });

    it('should not toggle the pressed state when disabled', () => {
        component.disabled = true;
        fixture.detectChanges();
        expect(component.pressed).toBe(false);
        button.nativeElement.click();
        expect(component.pressed).toBe(false);
    });

    it('should emit the pressed state change event on toggle', () => {
        const spy = jest.spyOn(component, 'onToggle');
        button.nativeElement.click();
        expect(spy).toHaveBeenCalledWith(true);
        button.nativeElement.click();
        expect(spy).toHaveBeenCalledWith(false);
    });
});

describe('RdxToggleDirective with Reactive Forms', () => {
    let component: ReactiveFormTestComponent;
    let fixture: ComponentFixture<ReactiveFormTestComponent>;
    let button: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormTestComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReactiveFormTestComponent);
        component = fixture.componentInstance;
        button = fixture.debugElement.query(By.css('button'));
        fixture.detectChanges();
    });

    it('should sync with FormControl value', () => {
        expect(component.toggleControl.value).toBe(false);
        expect(button.nativeElement.getAttribute('aria-pressed')).toBe('false');

        component.toggleControl.setValue(true);
        fixture.detectChanges();
        expect(button.nativeElement.getAttribute('aria-pressed')).toBe('true');

        button.nativeElement.click();
        fixture.detectChanges();
        expect(component.toggleControl.value).toBe(true);
    });

    it('should reflect FormControl disabled state', () => {
        component.toggleControl.disable();
        fixture.detectChanges();

        expect(button.nativeElement.disabled).toBe(true);
        expect(button.nativeElement.getAttribute('data-disabled')).toBe('');

        // Should not toggle when disabled
        button.nativeElement.click();
        expect(component.toggleControl.value).toBe(false);
    });

    it('should update FormControl when toggled', () => {
        button.nativeElement.click();
        fixture.detectChanges();

        expect(component.toggleControl.value).toBe(true);
        expect(button.nativeElement.getAttribute('data-state')).toBe('on');

        button.nativeElement.click();
        fixture.detectChanges();

        expect(component.toggleControl.value).toBe(false);
        expect(button.nativeElement.getAttribute('data-state')).toBe('off');
    });

    it('should handle external FormControl changes', () => {
        component.toggleControl.setValue(true);
        fixture.detectChanges();
        expect(button.nativeElement.getAttribute('aria-pressed')).toBe('true');

        component.toggleControl.setValue(false);
        fixture.detectChanges();
        expect(button.nativeElement.getAttribute('aria-pressed')).toBe('false');
    });
});
