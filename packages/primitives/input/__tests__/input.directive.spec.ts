import { RdxInputDirective, RdxInputValueChangeEvent } from '../src/input.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxValidationError } from '@radix-ng/primitives/core';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <input
            rdxInput
            [value]="value"
            [defaultValue]="defaultValue"
            [disabled]="disabled"
            [required]="required"
            [invalid]="invalid"
            [readonly]="readonly"
            [name]="name"
            [errors]="errors"
            [minLength]="minLength"
            [maxLength]="maxLength"
            [pattern]="pattern"
            [touched]="touched"
            [dirty]="dirty"
            (onValueChange)="onValueChange($event)"
            (touchedChange)="touches = touches + 1"
            (touch)="touchEmits = touchEmits + 1"
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
    readonly = false;
    name: string | undefined;
    errors: readonly RdxValidationError[] = [];
    minLength: number | undefined;
    maxLength: number | undefined;
    pattern: readonly RegExp[] | undefined;
    touched = false;
    dirty = false;
    touches = 0;
    touchEmits = 0;
    changes: RdxInputValueChangeEvent[] = [];

    onValueChange(event: RdxInputValueChangeEvent): void {
        this.changes.push(event);
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();
            expect(input.value).toBe('Initial');

            fixture.componentInstance.value = 'Controlled';
            fixture.changeDetectorRef.markForCheck();
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
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();

            expect(input.getAttribute('disabled')).toBe('');
            expect(input.getAttribute('required')).toBe('');
            expect(input.getAttribute('aria-invalid')).toBe('true');
            expect(input.getAttribute('data-disabled')).toBe('');
            expect(input.getAttribute('data-required')).toBe('');
            expect(input.getAttribute('data-invalid')).toBe('');
        });

        it('reflects readonly state', () => {
            fixture.componentInstance.readonly = true;
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();

            expect(input.getAttribute('readonly')).toBe('');
            expect(input.getAttribute('data-readonly')).toBe('');
        });

        it('reflects name and constraint attributes', () => {
            fixture.componentInstance.name = 'email';
            fixture.componentInstance.minLength = 3;
            fixture.componentInstance.maxLength = 20;
            fixture.componentInstance.pattern = [/[a-z]+/];
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();

            expect(input.getAttribute('name')).toBe('email');
            expect(input.getAttribute('minlength')).toBe('3');
            expect(input.getAttribute('maxlength')).toBe('20');
            expect(input.getAttribute('pattern')).toBe('[a-z]+');
        });

        it('does not reflect multiple patterns to the native attribute', () => {
            fixture.componentInstance.pattern = [/[a-z]+/, /\d+/];
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();

            expect(input.hasAttribute('pattern')).toBe(false);
        });

        it('marks the input invalid when errors are present', () => {
            fixture.componentInstance.errors = [{ kind: 'server', message: 'Taken' }];
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();

            expect(input.getAttribute('aria-invalid')).toBe('true');
            expect(input.getAttribute('data-invalid')).toBe('');

            fixture.componentInstance.errors = [];
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();

            expect(input.hasAttribute('data-invalid')).toBe(false);
        });

        it('tracks touched and dirty state and emits touchedChange + touch on blur', () => {
            expect(input.hasAttribute('data-touched')).toBe(false);
            expect(input.hasAttribute('data-dirty')).toBe(false);

            input.value = 'Next';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            expect(input.getAttribute('data-dirty')).toBe('');

            input.dispatchEvent(new FocusEvent('blur'));
            fixture.detectChanges();
            expect(input.getAttribute('data-touched')).toBe('');
            // Both notification shapes: touchedChange (21.x experimental
            // listens to it) and touch (stable Angular 22 listens to it).
            expect(fixture.componentInstance.touches).toBe(1);
            expect(fixture.componentInstance.touchEmits).toBe(1);
        });

        it('accepts form-owned touched and dirty inputs', () => {
            fixture.componentInstance.touched = true;
            fixture.componentInstance.dirty = true;
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();

            expect(input.getAttribute('data-touched')).toBe('');
            expect(input.getAttribute('data-dirty')).toBe('');
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
