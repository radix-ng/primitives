import { ChangeDetectionStrategy, Component, DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { RdxLabelDirective } from '../src/label.directive';

/* Explanation:

    Environment Setup: In addition to the label, the template now includes a div and an input button to test interaction with different types of elements.

    Double-click Prevention: Tests whether the directive correctly prevents default actions during a double-click, except on form elements like buttons.

    Single Click Handling: Verifies that the directive does not interfere with default actions on single clicks.

    Interaction with Children: Checks that double-clicks on non-form elements like divs also trigger prevention of default actions.*/
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <label rdxLabel>
            Test Label
            <div>Click Me</div>
            <input type="button" value="Button" />
            <button type="button"><span>Nested</span></button>
        </label>
    `,
    imports: [RdxLabelDirective]
})
class TestComponent {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <label rdxLabel>Plain</label>
        <label id="custom-id" rdxLabel htmlFor="ctrl">Wired</label>
        <label rdxLabel for="ctrl">Native</label>
        <label [htmlFor]="target()" rdxLabel for="ctrl">Overridden</label>
        <label [htmlFor]="target()" rdxLabel>Dynamic</label>
        <label rdxLabel for="">
            Explicit empty
            <input />
        </label>
        <input id="ctrl" />
        <input id="replacement" />
    `,
    imports: [RdxLabelDirective]
})
class AttributeHostComponent {
    readonly target = signal<string | undefined>('replacement');
}

describe('RdxLabelDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let labelElement: DebugElement;
    let inputElement: DebugElement;
    let divElement: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        labelElement = fixture.debugElement.query(By.directive(RdxLabelDirective));
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
        vi.spyOn(mockEventLabel, 'preventDefault');

        labelElement.triggerEventHandler('mousedown', mockEventLabel);
        expect(mockEventLabel.preventDefault).toHaveBeenCalled();

        // Double-click event targeting the input element
        const mockEventInput = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            detail: 2
        });
        Object.defineProperty(mockEventInput, 'target', { value: inputElement.nativeElement });
        vi.spyOn(mockEventInput, 'preventDefault');

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
        vi.spyOn(mockEvent, 'preventDefault');

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
        vi.spyOn(mockEvent, 'preventDefault');

        labelElement.triggerEventHandler('mousedown', mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should not prevent default when double-clicking an element nested inside a control', () => {
        const nestedSpan = fixture.debugElement.query(By.css('button span'));
        const mockEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            detail: 2
        });
        Object.defineProperty(mockEvent, 'target', { value: nestedSpan.nativeElement });
        vi.spyOn(mockEvent, 'preventDefault');

        labelElement.triggerEventHandler('mousedown', mockEvent);
        expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
});

describe('RdxLabelDirective attributes', () => {
    let fixture: ComponentFixture<AttributeHostComponent>;
    let labels: DebugElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [AttributeHostComponent] });
        fixture = TestBed.createComponent(AttributeHostComponent);
        fixture.detectChanges();
        labels = fixture.debugElement.queryAll(By.directive(RdxLabelDirective));
    });

    it('assigns a generated id by default and no "for" attribute', () => {
        const plain = labels[0].nativeElement as HTMLLabelElement;

        expect(plain.getAttribute('id')).toMatch(/^rdx-label-/);
        expect(plain.hasAttribute('for')).toBe(false);
    });

    it('reflects the provided id and htmlFor inputs', () => {
        const wired = labels[1].nativeElement as HTMLLabelElement;

        expect(wired.getAttribute('id')).toBe('custom-id');
        expect(wired.getAttribute('for')).toBe('ctrl');
    });

    it('preserves an authored native for and its association', () => {
        const native = labels[2].nativeElement as HTMLLabelElement;
        expect(native.getAttribute('for')).toBe('ctrl');
        expect(native.control?.id).toBe('ctrl');
    });

    it('uses the current htmlFor, restoring the native for after clearing the input', () => {
        const overridden = labels[3].nativeElement as HTMLLabelElement;
        const dynamic = labels[4].nativeElement as HTMLLabelElement;
        expect(overridden.control?.id).toBe('replacement');
        expect(dynamic.control?.id).toBe('replacement');

        fixture.componentInstance.target.set(undefined);
        fixture.detectChanges();
        expect(overridden.control?.id).toBe('ctrl');
        expect(dynamic.hasAttribute('for')).toBe(false);
        expect(dynamic.control).toBeNull();
    });

    it('preserves an explicitly empty native for', () => {
        const empty = labels[5].nativeElement as HTMLLabelElement;
        expect(empty.getAttribute('for')).toBe('');
        expect(empty.control).toBeNull();
    });
});
