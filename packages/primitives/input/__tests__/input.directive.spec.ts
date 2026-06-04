import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxInputDirective, RdxInputValueChangeEvent } from '../src/input.directive';

@Component({
    template: `
        <input
            [value]="value"
            [defaultValue]="defaultValue"
            [disabled]="disabled"
            [required]="required"
            [invalid]="invalid"
            (onValueChange)="onValueChange($event)"
            rdxInput
        />
    `,
    imports: [RdxInputDirective]
})
class StandaloneHostComponent {
    value: string | undefined;
    defaultValue: string | undefined;
    disabled = false;
    required = false;
    invalid = false;
    changes: RdxInputValueChangeEvent[] = [];

    onValueChange(event: RdxInputValueChangeEvent): void {
        this.changes.push(event);
    }
}

@Component({
    template: `
        <div rdxFieldRoot required>
            <label rdxFieldLabel>Email</label>
            <input id="email" rdxInput />
            <p id="email-description" rdxFieldDescription>Enter your work email.</p>
            <p id="email-error" rdxFieldError>Email is required.</p>
        </div>
    `,
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldDescription, RdxFieldError, RdxInputDirective]
})
class FieldHostComponent {}

describe('Input', () => {
    describe('standalone', () => {
        let fixture: ComponentFixture<StandaloneHostComponent>;
        let input: HTMLInputElement;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [StandaloneHostComponent]
            });

            fixture = TestBed.createComponent(StandaloneHostComponent);
            fixture.detectChanges();
            input = fixture.nativeElement.querySelector('input');
        });

        it('applies controlled and default values', () => {
            fixture.componentInstance.defaultValue = 'Initial';
            fixture.detectChanges();
            expect(input.value).toBe('Initial');

            fixture.componentInstance.value = 'Controlled';
            fixture.detectChanges();
            expect(input.value).toBe('Controlled');
        });

        it('emits value changes from user input', () => {
            input.value = 'Next';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            expect(fixture.componentInstance.changes[0].value).toBe('Next');
        });

        it('tracks focused and filled state', () => {
            input.dispatchEvent(new FocusEvent('focus'));
            fixture.detectChanges();
            expect(input.getAttribute('data-focused')).toBe('');

            input.value = 'Next';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            expect(input.getAttribute('data-filled')).toBe('');

            input.dispatchEvent(new FocusEvent('blur'));
            fixture.detectChanges();
            expect(input.hasAttribute('data-focused')).toBe(false);
        });

        it('reflects disabled, required, and invalid state', () => {
            fixture.componentInstance.disabled = true;
            fixture.componentInstance.required = true;
            fixture.componentInstance.invalid = true;
            fixture.detectChanges();

            expect(input.getAttribute('disabled')).toBe('');
            expect(input.getAttribute('required')).toBe('');
            expect(input.getAttribute('aria-invalid')).toBe('true');
            expect(input.getAttribute('data-disabled')).toBe('');
            expect(input.getAttribute('data-required')).toBe('');
            expect(input.getAttribute('data-invalid')).toBe('');
        });
    });

    describe('with Field', () => {
        let fixture: ComponentFixture<FieldHostComponent>;
        let root: HTMLElement;
        let label: HTMLLabelElement;
        let input: HTMLInputElement;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [FieldHostComponent]
            });

            fixture = TestBed.createComponent(FieldHostComponent);
            fixture.detectChanges();
            root = fixture.nativeElement.querySelector('[rdxFieldRoot]');
            label = fixture.nativeElement.querySelector('label');
            input = fixture.nativeElement.querySelector('input');
        });

        it('connects field labeling and descriptions', () => {
            expect(input.getAttribute('id')).toBe('email');
            expect(label.getAttribute('for')).toBe('email');
            expect(input.getAttribute('aria-describedby')).toBe('email-description');
            expect(input.getAttribute('required')).toBe('');
        });

        it('updates Field focused, filled, dirty, and touched states', () => {
            input.dispatchEvent(new FocusEvent('focus'));
            fixture.detectChanges();
            expect(root.getAttribute('data-focused')).toBe('');

            input.value = 'hello@example.com';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            expect(root.getAttribute('data-filled')).toBe('');
            expect(root.getAttribute('data-dirty')).toBe('');

            input.dispatchEvent(new FocusEvent('blur'));
            fixture.detectChanges();
            expect(root.getAttribute('data-touched')).toBe('');
            expect(root.hasAttribute('data-focused')).toBe(false);
        });
    });
});
