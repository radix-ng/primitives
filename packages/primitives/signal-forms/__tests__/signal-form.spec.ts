import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { RdxFieldError, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { RdxSignalField } from '../src/signal-field';
import { RdxSignalForm } from '../src/signal-form';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, RdxSignalForm],
    // The form is bound once; the field carries only `name` — its errors are routed by `errorsFor`.
    template: `
        <form [rdxSignalForm]="formTree" validationMode="always" rdxFormRoot>
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
        // `name="email"` field, whose client routed errors force its invalid state.
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
        <form [rdxSignalForm]="formTree" validationMode="always" rdxFormRoot>
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

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, RdxFieldError, RdxSignalForm, RdxSignalField],
    // Both adapters on the same field: per-field `rdxSignalField` AND form-level `name` routing.
    // `messages()` must dedupe so the shared error renders once.
    template: `
        <form [rdxSignalForm]="formTree" validationMode="always" rdxFormRoot>
            <div rdxFieldRoot name="email">
                <input [formField]="email" rdxSignalField />
                <p #err="rdxFieldError" rdxFieldError>{{ err.messages().join('|') }}</p>
            </div>
        </form>
    `
})
class BothAdaptersHost {
    readonly model = signal({ email: '' });
    readonly formTree = form(this.model, (path) => {
        required(path.email, { message: 'Email is required.' });
    });

    get email() {
        return this.formTree.email;
    }
}

describe('RdxSignalForm + RdxSignalField on the same field — messages dedupe', () => {
    let fixture: ComponentFixture<BothAdaptersHost>;
    let errorEl: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [BothAdaptersHost] });
        fixture = TestBed.createComponent(BothAdaptersHost);
        fixture.detectChanges();
        errorEl = fixture.debugElement.query(By.css('[rdxFieldError]')).nativeElement;
    });

    it('renders the shared error exactly once (no duplicate from the two sources)', () => {
        expect(errorEl.textContent?.trim()).toBe('Email is required.');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, RdxFieldError, RdxSignalForm],
    // No per-field `rdxSignalField`; errors are routed form-level by `errorsFor`. The default
    // `validationMode="onBlur"` must gate these client errors too (not show them eagerly like server errors).
    template: `
        <form [rdxSignalForm]="formTree" (onFormSubmit)="submitted = true" rdxFormRoot>
            <div rdxFieldRoot name="email">
                <input [formField]="email" />
                <p #err="rdxFieldError" rdxFieldError>{{ err.messages().join(' ') }}</p>
            </div>
        </form>
    `
})
class GatedNameRoutingHost {
    submitted = false;
    readonly model = signal({ email: '' });
    readonly formTree = form(this.model, (path) => {
        required(path.email, { message: 'Email is required.' });
    });

    get email() {
        return this.formTree.email;
    }
}

describe('RdxSignalForm — name-routed client errors honour validationMode (default onBlur)', () => {
    let fixture: ComponentFixture<GatedNameRoutingHost>;
    let host: GatedNameRoutingHost;
    let fieldEl: HTMLElement;
    let formEl: HTMLFormElement;
    const error = () =>
        (fixture.debugElement.query(By.css('[rdxFieldError]')).nativeElement as HTMLElement).textContent?.trim();

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [GatedNameRoutingHost] });
        fixture = TestBed.createComponent(GatedNameRoutingHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        fieldEl = fixture.debugElement.query(By.css('[rdxFieldRoot]')).nativeElement;
        formEl = fixture.debugElement.query(By.css('form')).nativeElement;
    });

    it('is neutral on load — client errors are NOT shown eagerly despite the routing', () => {
        expect(fieldEl.getAttribute('data-invalid')).toBeNull();
        expect(fieldEl.getAttribute('data-valid')).toBeNull();
        expect(error()).toBe('');
        // …the Form's presentation `data-invalid` stays neutral too (it must not leak the gated state),
        // but it tracks the actual invalidity via `anyInvalid()` for the submit guard.
        expect(formEl.getAttribute('data-invalid')).toBeNull();
        const formRoot = fixture.debugElement.query(By.directive(RdxFormRoot)).injector.get(RdxFormRoot);
        expect(formRoot.anyInvalid()).toBe(true);
    });

    it('reveals the routed error on blur of the bare [formField] control (onBlur, no rdxSignalField)', () => {
        // Signal Forms' `[formField]` marks the field touched on blur; `rdxSignalForm` exposes it per-name
        // via `touchedFor`, so the field reveals under `onBlur` without an `rdxSignalField`/`rdxFieldControl`.
        const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
        input.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(fieldEl.getAttribute('data-invalid')).toBe('');
        expect(error()).toBe('Email is required.');
    });

    it('reveals the routed error + blocks the submit on a pristine invalid submit', () => {
        formEl.dispatchEvent(new SubmitEvent('submit', { cancelable: true, bubbles: true }));
        fixture.detectChanges();
        expect(fieldEl.getAttribute('data-invalid')).toBe('');
        expect(error()).toBe('Email is required.');
        expect(host.submitted).toBe(false);
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, RdxFieldError, RdxSignalForm],
    // rdxSignalForm (client name-routing) AND a server `[errors]` input on the SAME form: the server
    // error must show immediately (eager); the client error stays gated by the default onBlur mode.
    template: `
        <form [rdxSignalForm]="formTree" [errors]="serverErrors()" rdxFormRoot>
            <div rdxFieldRoot name="email">
                <input [formField]="email" />
                <p #err="rdxFieldError" rdxFieldError>{{ err.messages().join(' ') }}</p>
            </div>
        </form>
    `
})
class ClientAndServerHost {
    readonly serverErrors = signal<Record<string, string>>({ email: 'Server says no' });
    readonly model = signal({ email: '' });
    readonly formTree = form(this.model, (path) => {
        required(path.email, { message: 'Email is required.' });
    });

    get email() {
        return this.formTree.email;
    }
}

describe('RdxSignalForm — server `errors` stay eager alongside name-routed client errors', () => {
    let fixture: ComponentFixture<ClientAndServerHost>;
    let fieldEl: HTMLElement;
    const error = () =>
        (fixture.debugElement.query(By.css('[rdxFieldError]')).nativeElement as HTMLElement).textContent?.trim();

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ClientAndServerHost] });
        fixture = TestBed.createComponent(ClientAndServerHost);
        fixture.detectChanges();
        fieldEl = fixture.debugElement.query(By.css('[rdxFieldRoot]')).nativeElement;
    });

    it('shows the server error immediately (the client provider does not disable `[errors]`)', () => {
        expect(fieldEl.getAttribute('data-invalid')).toBe('');
        expect(error()).toBe('Server says no');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, RdxFieldError, RdxSignalForm],
    // The Signal Forms model is VALID, but a server `[errors]` entry is present. The form must still
    // count as invalid and block submit — the form-level provider's "valid" must not win over a real
    // server error registered on the field.
    template: `
        <form [rdxSignalForm]="formTree" [errors]="serverErrors()" (onFormSubmit)="submitted = true" rdxFormRoot>
            <div rdxFieldRoot name="email">
                <input [formField]="email" />
                <p #err="rdxFieldError" rdxFieldError>{{ err.messages().join(' ') }}</p>
            </div>
        </form>
    `
})
class ValidModelServerErrorHost {
    submitted = false;
    readonly serverErrors = signal<Record<string, string>>({ email: 'Server says no' });
    readonly model = signal({ email: 'ada@example.com' });
    readonly formTree = form(this.model, (path) => {
        required(path.email, { message: 'Email is required.' });
    });

    get email() {
        return this.formTree.email;
    }
}

describe('RdxSignalForm — a server error blocks submit even when the client model is valid', () => {
    let fixture: ComponentFixture<ValidModelServerErrorHost>;
    let host: ValidModelServerErrorHost;
    let formEl: HTMLFormElement;
    let fieldEl: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ValidModelServerErrorHost] });
        fixture = TestBed.createComponent(ValidModelServerErrorHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        formEl = fixture.debugElement.query(By.css('form')).nativeElement;
        fieldEl = fixture.debugElement.query(By.css('[rdxFieldRoot]')).nativeElement;
    });

    it('aggregates the server error → field + form invalid, and submit is blocked', () => {
        expect(fieldEl.getAttribute('data-invalid')).toBe('');
        expect(formEl.getAttribute('data-invalid')).toBe('');
        formEl.dispatchEvent(new SubmitEvent('submit', { cancelable: true, bubbles: true }));
        fixture.detectChanges();
        expect(host.submitted).toBe(false);
    });

    it('submits once the server error is cleared (client model already valid)', () => {
        host.serverErrors.set({});
        fixture.detectChanges();
        formEl.dispatchEvent(new SubmitEvent('submit', { cancelable: true, bubbles: true }));
        fixture.detectChanges();
        expect(host.submitted).toBe(true);
    });
});
