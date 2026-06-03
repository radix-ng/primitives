import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';

@Component({
    template: `
        <div
            [invalid]="invalid"
            [disabled]="disabled"
            [required]="required"
            [dirty]="dirty"
            [touched]="touched"
            rdxFieldRoot
        >
            <label rdxFieldLabel>Email</label>
            <input id="email" rdxFieldControl />
            <p id="email-description" rdxFieldDescription>Enter your work email.</p>
            <p id="email-error" rdxFieldError>Email is required.</p>
        </div>
    `,
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError]
})
class TestHostComponent {
    invalid = false;
    disabled = false;
    required = false;
    dirty = false;
    touched = false;
}

describe('Field', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let root: HTMLElement;
    let label: HTMLLabelElement;
    let input: HTMLInputElement;
    let error: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestHostComponent]
        });

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        root = fixture.nativeElement.querySelector('[rdxFieldRoot]');
        label = fixture.nativeElement.querySelector('label');
        input = fixture.nativeElement.querySelector('input');
        error = fixture.nativeElement.querySelector('#email-error');
    });

    it('associates the label with the control', () => {
        expect(input.getAttribute('id')).toBe('email');
        expect(label.getAttribute('for')).toBe('email');
    });

    it('describes the control with description text by default', () => {
        expect(input.getAttribute('aria-describedby')).toBe('email-description');
        expect(error.hasAttribute('hidden')).toBe(true);
    });

    it('adds invalid state and error description when invalid', () => {
        fixture.componentInstance.invalid = true;
        fixture.detectChanges();

        expect(root.getAttribute('data-invalid')).toBe('');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.getAttribute('aria-describedby')).toBe('email-description email-error');
        expect(error.hasAttribute('hidden')).toBe(false);
    });

    it('reflects required, disabled, dirty, and touched states', () => {
        fixture.componentInstance.required = true;
        fixture.componentInstance.disabled = true;
        fixture.componentInstance.dirty = true;
        fixture.componentInstance.touched = true;
        fixture.detectChanges();

        expect(root.getAttribute('data-required')).toBe('');
        expect(root.getAttribute('data-disabled')).toBe('');
        expect(root.getAttribute('data-dirty')).toBe('');
        expect(root.getAttribute('data-touched')).toBe('');
        expect(input.getAttribute('required')).toBe('');
        expect(input.getAttribute('disabled')).toBe('');
        expect(input.getAttribute('aria-required')).toBe('true');
        expect(input.getAttribute('aria-disabled')).toBe('true');
    });

    it('tracks focused and filled states from the control', () => {
        input.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
        expect(root.getAttribute('data-focused')).toBe('');

        input.value = 'hello@example.com';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(root.getAttribute('data-filled')).toBe('');

        input.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(root.hasAttribute('data-focused')).toBe(false);
    });
});
