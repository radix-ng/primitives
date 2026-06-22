import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { RdxSignalForm } from '../src/signal-form';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, RdxSignalForm],
    // The form is bound once; the field carries only `name` — its errors are routed by `errorsFor`.
    template: `
        <form [rdxSignalForm]="formTree" rdxFormRoot>
            <div rdxFieldRoot name="email">
                <input [formField]="email" />
            </div>
        </form>
    `
})
class SignalFormHost {
    readonly model = signal({ email: '' });
    readonly formTree = form(this.model, (path) => {
        required(path.email);
    });

    get email() {
        return this.formTree.email;
    }
}

describe('RdxSignalForm — aggregate state + errorsFor routing', () => {
    let fixture: ComponentFixture<SignalFormHost>;
    let host: SignalFormHost;
    let formEl: HTMLElement;
    let fieldEl: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [SignalFormHost] });
        fixture = TestBed.createComponent(SignalFormHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        formEl = fixture.debugElement.query(By.css('[rdxFormRoot]')).nativeElement;
        fieldEl = fixture.debugElement.query(By.css('[rdxFieldRoot]')).nativeElement;
    });

    it('reflects form-level invalid on the form root (aggregate state)', () => {
        expect(formEl.getAttribute('data-invalid')).toBe('');
    });

    it('routes a field error to the named field via errorsFor (no per-field adapter)', () => {
        // `required` + empty → the email field is invalid; `errorsFor('email')` surfaces it to the
        // `name="email"` field, whose external errors force its invalid state.
        expect(fieldEl.getAttribute('data-invalid')).toBe('');
    });

    it('clears both once the field becomes valid', () => {
        host.model.update((value) => ({ ...value, email: 'ada@example.com' }));
        fixture.detectChanges();
        expect(formEl.getAttribute('data-invalid')).toBeNull();
        expect(fieldEl.getAttribute('data-invalid')).toBeNull();
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, RdxSignalForm],
    // A nested field — `errorsFor` must walk the dotted path `address.street`, not just top-level keys.
    template: `
        <form [rdxSignalForm]="formTree" rdxFormRoot>
            <div rdxFieldRoot name="address.street">
                <input [formField]="street" />
            </div>
        </form>
    `
})
class NestedSignalFormHost {
    readonly model = signal({ address: { street: '' } });
    readonly formTree = form(this.model, (path) => {
        required(path.address.street);
    });

    get street() {
        return this.formTree.address.street;
    }
}

describe('RdxSignalForm — errorsFor resolves a dotted path', () => {
    let fixture: ComponentFixture<NestedSignalFormHost>;
    let host: NestedSignalFormHost;
    let fieldEl: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [NestedSignalFormHost] });
        fixture = TestBed.createComponent(NestedSignalFormHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        fieldEl = fixture.debugElement.query(By.css('[rdxFieldRoot]')).nativeElement;
    });

    it('routes a nested field error to the `name="address.street"` field', () => {
        expect(fieldEl.getAttribute('data-invalid')).toBe('');
    });

    it('clears the nested field once it becomes valid', () => {
        host.model.update((value) => ({ ...value, address: { street: '123 Main St' } }));
        fixture.detectChanges();
        expect(fieldEl.getAttribute('data-invalid')).toBeNull();
    });
});
