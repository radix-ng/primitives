import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxLabelRootDirective } from '../src/label-root.directive';

/* Explanation:

    Environment Setup: In addition to the label, the template now includes a div and an input button to test interaction with different types of elements.

    Double-click Prevention: Tests whether the directive correctly prevents default actions during a double-click, except on form elements like buttons.

    Single Click Handling: Verifies that the directive does not interfere with default actions on single clicks.

    Interaction with Children: Checks that double-clicks on non-form elements like divs also trigger prevention of default actions.*/
@Component({
    template: `
        <label LabelRoot>
            Test Label
            <div>Click Me</div>
            <input
                type="button"
                value="Button"
            />
        </label>
    `
})
class TestComponent {}

describe('RdxLabelRootDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let labelElement: DebugElement;
    let inputElement: DebugElement;
    let divElement: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RdxLabelRootDirective],
            declarations: [TestComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        labelElement = fixture.debugElement.query(By.directive(RdxLabelRootDirective));
        inputElement = fixture.debugElement.query(By.css('input'));
        divElement = fixture.debugElement.query(By.css('div'));
    });

    it('should create an instance of the directive', () => {
        expect(labelElement).toBeTruthy();
    });

    it('should prevent default action on double-clicking the label, not on input elements', () => {
        const mockEventLabel = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            detail: 2
        });
        Object.defineProperty(mockEventLabel, 'target', { value: labelElement.nativeElement });
        jest.spyOn(mockEventLabel, 'preventDefault');

        labelElement.triggerEventHandler('mousedown', mockEventLabel);
        expect(mockEventLabel.preventDefault).toHaveBeenCalled();

        // Double-click event targeting the input element
        const mockEventInput = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            detail: 2
        });
        Object.defineProperty(mockEventInput, 'target', { value: inputElement.nativeElement });
        jest.spyOn(mockEventInput, 'preventDefault');

        labelElement.triggerEventHandler('mousedown', mockEventInput);
        expect(mockEventInput.preventDefault).not.toHaveBeenCalled();
    });

    it('should not prevent default action on single clicks', () => {
        const mockEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            detail: 1
        });
        Object.defineProperty(mockEvent, 'target', { value: labelElement.nativeElement });
        jest.spyOn(mockEvent, 'preventDefault');

        labelElement.triggerEventHandler('mousedown', mockEvent);
        expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should prevent default action when double-clicking non-button/input/select/textarea elements within the label', () => {
        const mockEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            detail: 2
        });
        Object.defineProperty(mockEvent, 'target', { value: divElement.nativeElement });
        jest.spyOn(mockEvent, 'preventDefault');

        labelElement.triggerEventHandler('mousedown', mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
});
