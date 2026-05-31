import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxVisuallyHiddenInputBubbleDirective } from '../src/visually-hidden-input-bubble.directive';

@Component({
    imports: [RdxVisuallyHiddenInputBubbleDirective],
    template: `
        <input
            [name]="name"
            [value]="value"
            [required]="required"
            (change)="onChange($event)"
            type="checkbox"
            rdxVisuallyHiddenInputBubble
        />
    `
})
class TestComponent {
    name = 'agree';
    value = 'on';
    required = true;

    lastChangeValue: string | null = null;

    onChange(event: Event) {
        this.lastChangeValue = (event.target as HTMLInputElement).value;
    }
}

describe('RdxVisuallyHiddenInputBubbleDirective', () => {
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

    it('should reflect the bound form attributes', () => {
        expect(input.nativeElement.getAttribute('name')).toBe('agree');
        expect(input.nativeElement.getAttribute('required')).toBe('true');
    });

    it('should be fully hidden by default (composed visually-hidden directive)', () => {
        expect(input.nativeElement.getAttribute('aria-hidden')).toBe('true');
        expect(input.nativeElement.hidden).toBe(true);
        expect(input.nativeElement.style.display).toBe('none');
    });

    it('should write the value onto the native input', () => {
        expect(input.nativeElement.value).toBe('on');
    });

    it('should dispatch a bubbling change event when the value changes', () => {
        component.value = 'off';
        fixture.detectChanges();

        expect(input.nativeElement.value).toBe('off');
        expect(component.lastChangeValue).toBe('off');
    });
});
