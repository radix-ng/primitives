import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { RdxSwitchInput } from '../src/switch-input';
import { RdxSwitchCheckedChangeEvent, RdxSwitchRoot } from '../src/switch-root';
import { RdxSwitchThumb } from '../src/switch-thumb';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxSwitchRoot, RdxSwitchThumb, RdxSwitchInput],
    template: `
        <button
            [(checked)]="checked"
            [disabled]="disabled()"
            [readonly]="readonly()"
            [required]="required()"
            (onCheckedChange)="onChange($event)"
            rdxSwitchRoot
        >
            <input rdxSwitchInput />
            <span rdxSwitchThumb></span>
        </button>
    `
})
class TestComponent {
    readonly checked = signal<boolean | undefined>(undefined);
    readonly disabled = signal(false);
    readonly readonly = signal(false);
    readonly required = signal(false);

    onChange = vi.fn<(change: RdxSwitchCheckedChangeEvent) => void>();
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb],
    template: `
        <button rdxSwitchRoot defaultChecked>
            <input rdxSwitchInput />
            <span rdxSwitchThumb></span>
        </button>
    `
})
class DefaultCheckedSwitch {}

describe('RdxSwitch', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;
    let root: HTMLButtonElement;
    let thumb: HTMLElement;
    let input: HTMLInputElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestComponent] });
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxSwitchRoot]')).nativeElement;
        thumb = fixture.debugElement.query(By.css('[rdxSwitchThumb]')).nativeElement;
        input = fixture.debugElement.query(By.css('[rdxSwitchInput]')).nativeElement;
    });

    it('renders the switch role and unchecked state', () => {
        expect(root.getAttribute('role')).toBe('switch');
        expect(root.getAttribute('type')).toBe('button');
        expect(root.getAttribute('aria-checked')).toBe('false');
        expect(root.getAttribute('data-unchecked')).toBe('');
        expect(root.getAttribute('data-checked')).toBeNull();
        expect(thumb.getAttribute('data-unchecked')).toBe('');
    });

    it('reflects a controlled checked binding', () => {
        component.checked.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-checked')).toBe('');
        expect(root.getAttribute('aria-checked')).toBe('true');
        expect(input.checked).toBe(true);
    });

    it('starts on from uncontrolled defaultChecked (no checked binding)', () => {
        const f = TestBed.createComponent(DefaultCheckedSwitch);
        f.detectChanges();
        const r = f.debugElement.query(By.css('[rdxSwitchRoot]')).nativeElement as HTMLElement;
        const inp = f.debugElement.query(By.css('[rdxSwitchInput]')).nativeElement as HTMLInputElement;
        expect(r.getAttribute('aria-checked')).toBe('true');
        expect(r.getAttribute('data-checked')).toBe('');
        expect(inp.checked).toBe(true);
    });

    it('toggles on click and emits onCheckedChange', () => {
        root.click();
        fixture.detectChanges();
        expect(component.checked()).toBe(true);
        expect(root.getAttribute('data-checked')).toBe('');
        expect(thumb.getAttribute('data-checked')).toBe('');
        expect(component.onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
                checked: true,
                eventDetails: expect.objectContaining({ reason: 'none', trigger: root })
            })
        );

        root.click();
        fixture.detectChanges();
        expect(component.checked()).toBe(false);
        expect(component.onChange).toHaveBeenLastCalledWith(expect.objectContaining({ checked: false }));
    });

    it('allows canceling before checked state updates', () => {
        component.onChange.mockImplementationOnce((change) => change.eventDetails.cancel());

        root.click();
        fixture.detectChanges();

        expect(component.checked()).toBeFalsy();
        expect(root.getAttribute('aria-checked')).toBe('false');
    });

    it('does not toggle when disabled', () => {
        component.disabled.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-disabled')).toBe('');
        // Native `<button>` → native `disabled` (Base UI nativeButton path).
        expect(root.hasAttribute('disabled')).toBe(true);

        root.click();
        fixture.detectChanges();
        expect(component.checked()).toBeFalsy();
        expect(component.onChange).not.toHaveBeenCalled();
    });

    it('does not toggle when read-only but stays focusable', () => {
        component.readonly.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-readonly')).toBe('');
        expect(root.getAttribute('aria-readonly')).toBe('true');
        expect(root.hasAttribute('disabled')).toBe(false);

        root.click();
        fixture.detectChanges();
        expect(component.checked()).toBeFalsy();
    });

    it('exposes required state', () => {
        component.required.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('aria-required')).toBe('true');
        expect(root.getAttribute('data-required')).toBe('');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb],
    template: `
        <form [formGroup]="form">
            <button id="airplane" formControlName="airplaneMode" rdxSwitchRoot>
                <input rdxSwitchInput />
                <span rdxSwitchThumb></span>
            </button>
        </form>
    `
})
class ReactiveFormSwitch {
    private readonly fb = inject(FormBuilder);
    form: FormGroup = this.fb.group({ airplaneMode: new FormControl(false) });
}

describe('RdxSwitch with ReactiveForms', () => {
    let fixture: ComponentFixture<ReactiveFormSwitch>;
    let component: ReactiveFormSwitch;
    let root: HTMLButtonElement;
    let input: HTMLInputElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ReactiveFormSwitch] });
        fixture = TestBed.createComponent(ReactiveFormSwitch);
        component = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxSwitchRoot]')).nativeElement;
        input = fixture.debugElement.query(By.css('[rdxSwitchInput]')).nativeElement;
    });

    it('initializes from the form control', () => {
        expect(component.form.value.airplaneMode).toBe(false);
        expect(root.getAttribute('data-unchecked')).toBe('');
        expect(input.checked).toBe(false);
    });

    it('updates the form control on click', () => {
        root.click();
        fixture.detectChanges();
        expect(component.form.value.airplaneMode).toBe(true);
        expect(root.getAttribute('data-checked')).toBe('');
    });

    it('reflects programmatic changes and disabling', () => {
        component.form.get('airplaneMode')?.setValue(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-checked')).toBe('');

        component.form.get('airplaneMode')?.disable();
        fixture.detectChanges();
        expect(input.disabled).toBe(true);
        expect(root.getAttribute('data-disabled')).toBe('');

        root.click();
        fixture.detectChanges();
        expect(component.form.getRawValue().airplaneMode).toBe(true);
    });

    it('validates requiredTrue', () => {
        const control = component.form.get('airplaneMode');
        control?.addValidators(Validators.requiredTrue);
        control?.updateValueAndValidity();
        fixture.detectChanges();
        expect(component.form.valid).toBe(false);

        root.click();
        fixture.detectChanges();
        expect(component.form.valid).toBe(true);
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb],
    template: `
        <button [value]="'enabled'" name="airplane" rdxSwitchRoot>
            <input rdxSwitchInput />
            <span rdxSwitchThumb></span>
        </button>
    `
})
class SubmitValueSwitch {}

describe('RdxSwitch submit value (`value` alias)', () => {
    it('defaults the hidden input value to "on" when [value] is not bound', () => {
        TestBed.configureTestingModule({ imports: [TestComponent] });
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        const input = fixture.debugElement.query(By.css('[rdxSwitchInput]')).nativeElement as HTMLInputElement;

        expect(input.getAttribute('value')).toBe('on');
    });

    it('forwards a custom [value] to the hidden input via the alias', () => {
        // The TS member is `submitValue`, but the public binding is still `[value]`,
        // and the hidden input must carry it for native form submission.
        TestBed.configureTestingModule({ imports: [SubmitValueSwitch] });
        const fixture = TestBed.createComponent(SubmitValueSwitch);
        fixture.detectChanges();
        const input = fixture.debugElement.query(By.css('[rdxSwitchInput]')).nativeElement as HTMLInputElement;

        expect(input.getAttribute('value')).toBe('enabled');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb],
    template: `
        <button [invalid]="invalid()" [errors]="errors()" rdxSwitchRoot>
            <input rdxSwitchInput />
            <span rdxSwitchThumb></span>
        </button>
    `
})
class SwitchValidationHost {
    readonly invalid = signal(false);
    readonly errors = signal<{ kind: string; message?: string }[]>([]);
}

describe('RdxSwitch validation state (batch #4)', () => {
    let fixture: ComponentFixture<SwitchValidationHost>;
    let host: SwitchValidationHost;
    let root: HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [SwitchValidationHost] });
        fixture = TestBed.createComponent(SwitchValidationHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxSwitchRoot]')).nativeElement;
    });

    it('is valid by default', () => {
        expect(root.getAttribute('data-valid')).toBe('');
        expect(root.getAttribute('data-invalid')).toBeNull();
        expect(root.getAttribute('aria-invalid')).toBeNull();
    });

    it('reflects the invalid input', () => {
        host.invalid.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(root.getAttribute('aria-invalid')).toBe('true');
    });

    it('is invalid when the errors list is non-empty', () => {
        host.errors.set([{ kind: 'required', message: 'Required.' }]);
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(root.getAttribute('aria-invalid')).toBe('true');
    });

    it('marks dirty after a toggle', () => {
        expect(root.getAttribute('data-dirty')).toBeNull();
        root.click();
        fixture.detectChanges();
        expect(root.getAttribute('data-dirty')).toBe('');
    });

    it('marks touched on blur', () => {
        expect(root.getAttribute('data-touched')).toBeNull();
        root.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(root.getAttribute('data-touched')).toBe('');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb],
    template: `
        <button [formField]="enabled" rdxSwitchRoot>
            <input rdxSwitchInput />
            <span rdxSwitchThumb></span>
        </button>
    `
})
class SwitchSignalFormHost {
    readonly model = signal({ enabled: false });
    readonly formTree = form(this.model);

    get enabled() {
        return this.formTree.enabled;
    }
}

describe('RdxSwitch with Signal Forms', () => {
    let fixture: ComponentFixture<SwitchSignalFormHost>;
    let host: SwitchSignalFormHost;
    let root: HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [SwitchSignalFormHost] });
        fixture = TestBed.createComponent(SwitchSignalFormHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxSwitchRoot]')).nativeElement;
    });

    it('updates the bound field on click (FormCheckboxControl)', () => {
        root.click();
        fixture.detectChanges();
        expect(host.model().enabled).toBe(true);
        expect(root.getAttribute('aria-checked')).toBe('true');
    });

    it('reflects a programmatic field change', () => {
        host.model.update((value) => ({ ...value, enabled: true }));
        fixture.detectChanges();
        expect(root.getAttribute('data-checked')).toBe('');
    });

    it('marks the field touched on blur', () => {
        root.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(host.enabled().touched()).toBe(true);
    });
});
