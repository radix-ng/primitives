import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { RdxNumberFieldDecrement } from '../src/number-field-decrement';
import { RdxNumberFieldGroup } from '../src/number-field-group';
import { RdxNumberFieldHiddenInput } from '../src/number-field-hidden-input';
import { RdxNumberFieldIncrement } from '../src/number-field-increment';
import { RdxNumberFieldInput } from '../src/number-field-input';
import { RdxNumberFieldRoot, RdxNumberFieldValueChangeEvent } from '../src/number-field-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxNumberFieldRoot,
        RdxNumberFieldGroup,
        RdxNumberFieldInput,
        RdxNumberFieldHiddenInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement
    ],
    template: `
        <div
            [(value)]="value"
            [defaultValue]="defaultValue()"
            [min]="min()"
            [max]="max()"
            [step]="step()"
            [name]="name()"
            [disabled]="disabled()"
            [readonly]="readonly()"
            [required]="required()"
            [format]="format()"
            (onValueChange)="onValueChange($event)"
            (onValueCommitted)="onValueCommitted($event)"
            rdxNumberFieldRoot
        >
            <input rdxNumberFieldHiddenInput />
            <div rdxNumberFieldGroup>
                <button rdxNumberFieldDecrement>-</button>
                <input rdxNumberFieldInput />
                <button rdxNumberFieldIncrement>+</button>
            </div>
        </div>
    `
})
class TestComponent {
    readonly value = signal<number | null>(null);
    readonly defaultValue = signal<number | undefined>(undefined);
    readonly min = signal<number | undefined>(undefined);
    readonly max = signal<number | undefined>(undefined);
    readonly step = signal(1);
    readonly name = signal<string | undefined>(undefined);
    readonly disabled = signal(false);
    readonly readonly = signal(false);
    readonly required = signal(false);
    readonly format = signal<Intl.NumberFormatOptions | undefined>(undefined);

    onValueChange = vi.fn<(change: RdxNumberFieldValueChangeEvent) => void>();
    onValueCommitted = vi.fn();
}

describe('RdxNumberField', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;
    let root: HTMLElement;
    let group: HTMLElement;
    let input: HTMLInputElement;
    let hiddenInput: HTMLInputElement;
    let increment: HTMLButtonElement;
    let decrement: HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestComponent] });
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxNumberFieldRoot]')).nativeElement;
        group = fixture.debugElement.query(By.css('[rdxNumberFieldGroup]')).nativeElement;
        input = fixture.debugElement.query(By.css('[rdxNumberFieldInput]')).nativeElement;
        hiddenInput = fixture.debugElement.query(By.css('[rdxNumberFieldHiddenInput]')).nativeElement;
        increment = fixture.debugElement.query(By.css('[rdxNumberFieldIncrement]')).nativeElement;
        decrement = fixture.debugElement.query(By.css('[rdxNumberFieldDecrement]')).nativeElement;
    });

    it('renders the group role and an empty input', () => {
        expect(root.getAttribute('role')).toBe('group');
        expect(input.getAttribute('aria-roledescription')).toBe('Number field');
        expect(input.value).toBe('');
    });

    it('applies the uncontrolled defaultValue and formats it', () => {
        component.defaultValue.set(42);
        fixture.detectChanges();
        expect(input.value).toBe('42');
    });

    it('formats a controlled value', () => {
        component.value.set(1234.5);
        fixture.detectChanges();
        expect(input.value).toBe('1,234.5');
    });

    it('increments and decrements on button click', () => {
        component.value.set(5);
        fixture.detectChanges();

        increment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBe(6);
        expect(component.onValueChange).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 6,
                eventDetails: expect.objectContaining({ reason: 'increment-press' })
            })
        );

        decrement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        decrement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBe(4);
    });

    it('respects the step size', () => {
        component.value.set(0);
        component.step.set(0.5);
        fixture.detectChanges();

        increment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBe(0.5);
    });

    it('clamps to min and max on step interactions', () => {
        component.value.set(10);
        component.max.set(10);
        component.min.set(0);
        fixture.detectChanges();

        increment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBe(10);
        expect(increment.hasAttribute('disabled')).toBe(true);

        component.value.set(0);
        fixture.detectChanges();
        expect(decrement.hasAttribute('disabled')).toBe(true);
    });

    it('increments with ArrowUp and decrements with ArrowDown', () => {
        component.value.set(5);
        fixture.detectChanges();

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBe(6);

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBe(5);
        expect(component.onValueCommitted).toHaveBeenCalled();
    });

    it('uses largeStep with the Shift modifier', () => {
        component.value.set(0);
        fixture.detectChanges();

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', shiftKey: true, bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBe(10);
    });

    it('parses typed input and updates the value', () => {
        input.value = '7';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBe(7);
        expect(component.onValueChange).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 7,
                eventDetails: expect.objectContaining({ reason: 'input-change' })
            })
        );
    });

    it('allows canceling value changes before state updates', () => {
        component.value.set(5);
        fixture.detectChanges();
        component.onValueChange.mockImplementationOnce((change) => change.eventDetails.cancel());

        increment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();

        expect(component.value()).toBe(5);
        expect(input.value).toBe('5');
    });

    it('clears the value when the input is emptied', () => {
        component.value.set(3);
        fixture.detectChanges();

        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBeNull();
    });

    it('normalizes the displayed value on blur', () => {
        component.value.set(2);
        fixture.detectChanges();

        input.value = '2.50';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        input.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(input.value).toBe('2.5');
        expect(component.value()).toBe(2.5);
    });

    it('does not change the value when disabled', () => {
        component.value.set(5);
        component.disabled.set(true);
        fixture.detectChanges();

        expect(root.getAttribute('data-disabled')).toBe('');
        expect(input.disabled).toBe(true);
        increment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBe(5);
    });

    it('does not change the value when read-only', () => {
        component.value.set(5);
        component.readonly.set(true);
        fixture.detectChanges();

        expect(root.getAttribute('data-readonly')).toBe('');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBe(5);
    });

    it('exposes data-required on root and group', () => {
        component.required.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-required')).toBe('');
        expect(group.getAttribute('data-required')).toBe('');
        expect(input.required).toBe(true);
    });

    it('keeps the optional native input for validation and serializes the name only once', () => {
        component.name.set('quantity');
        component.value.set(7);
        component.min.set(1);
        component.max.set(9);
        component.required.set(true);
        fixture.detectChanges();

        expect(hiddenInput.type).toBe('number');
        expect(hiddenInput.getAttribute('aria-hidden')).toBe('true');
        expect(hiddenInput.hasAttribute('name')).toBe(false);
        expect(hiddenInput.value).toBe('7');
        expect(hiddenInput.getAttribute('min')).toBe('1');
        expect(hiddenInput.getAttribute('max')).toBe('9');
        expect(hiddenInput.hasAttribute('required')).toBe(true);

        const serializedInput = root.parentElement?.querySelector('[data-rdx-native-form-control]') as HTMLInputElement;
        expect(serializedInput.name).toBe('quantity');
        expect(serializedInput.value).toBe('7');
    });

    it('updates the value from a hidden input change (autofill)', () => {
        hiddenInput.value = '8';
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
        fixture.detectChanges();
        expect(component.value()).toBe(8);
        expect(input.value).toBe('8');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxNumberFieldRoot, RdxNumberFieldInput, RdxNumberFieldIncrement],
    template: `
        <div [invalid]="invalid()" [errors]="errors()" rdxNumberFieldRoot>
            <input rdxNumberFieldInput />
            <button rdxNumberFieldIncrement>+</button>
        </div>
    `
})
class NumberFieldValidationHost {
    readonly invalid = signal(false);
    readonly errors = signal<{ kind: string; message?: string }[]>([]);
}

describe('RdxNumberField validation state (batch #4)', () => {
    let fixture: ComponentFixture<NumberFieldValidationHost>;
    let host: NumberFieldValidationHost;
    let root: HTMLElement;
    let input: HTMLInputElement;
    let increment: HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [NumberFieldValidationHost] });
        fixture = TestBed.createComponent(NumberFieldValidationHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxNumberFieldRoot]')).nativeElement;
        input = fixture.debugElement.query(By.css('[rdxNumberFieldInput]')).nativeElement;
        increment = fixture.debugElement.query(By.css('[rdxNumberFieldIncrement]')).nativeElement;
    });

    it('is valid by default', () => {
        expect(root.getAttribute('data-valid')).toBe('');
        expect(root.getAttribute('data-invalid')).toBeNull();
        expect(input.getAttribute('aria-invalid')).toBeNull();
    });

    it('reflects the invalid input on root and input', () => {
        host.invalid.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('is invalid when the errors list is non-empty', () => {
        host.errors.set([{ kind: 'required', message: 'Required.' }]);
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('marks dirty after a value change', () => {
        expect(root.getAttribute('data-dirty')).toBeNull();
        increment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();
        expect(root.getAttribute('data-dirty')).toBe('');
    });

    it('marks touched on input blur', () => {
        expect(root.getAttribute('data-touched')).toBeNull();
        input.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(root.getAttribute('data-touched')).toBe('');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxNumberFieldRoot, RdxNumberFieldInput, RdxNumberFieldIncrement],
    template: `
        <div [formField]="amount" rdxNumberFieldRoot>
            <input rdxNumberFieldInput />
            <button rdxNumberFieldIncrement>+</button>
        </div>
    `
})
class NumberFieldSignalFormHost {
    readonly model = signal<{ amount: number | null }>({ amount: 5 });
    readonly formTree = form(this.model);

    get amount() {
        return this.formTree.amount;
    }
}

describe('RdxNumberField with Signal Forms', () => {
    let fixture: ComponentFixture<NumberFieldSignalFormHost>;
    let host: NumberFieldSignalFormHost;
    let input: HTMLInputElement;
    let increment: HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [NumberFieldSignalFormHost] });
        fixture = TestBed.createComponent(NumberFieldSignalFormHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        input = fixture.debugElement.query(By.css('[rdxNumberFieldInput]')).nativeElement;
        increment = fixture.debugElement.query(By.css('[rdxNumberFieldIncrement]')).nativeElement;
    });

    it('reflects the bound field value (FormValueControl)', () => {
        expect(input.value).toBe('5');
        host.model.update((value) => ({ ...value, amount: 12 }));
        fixture.detectChanges();
        expect(input.value).toBe('12');
    });

    it('updates the bound field on interaction', () => {
        increment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();
        expect(host.model().amount).toBe(6);
    });

    it('resets the value and interaction state through Signal Forms', () => {
        const root = fixture.debugElement.query(By.css('[rdxNumberFieldRoot]')).nativeElement as HTMLElement;
        increment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();
        expect(root.getAttribute('data-dirty')).toBe('');

        host.formTree().reset({ amount: 5 });
        fixture.detectChanges();

        expect(host.model().amount).toBe(5);
        expect(host.amount().dirty()).toBe(false);
        expect(host.amount().touched()).toBe(false);
        expect(input.value).toBe('5');
        expect(root.getAttribute('data-dirty')).toBeNull();
        expect(root.getAttribute('data-touched')).toBeNull();
    });
});
