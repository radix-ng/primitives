import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { RdxFieldError, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { RdxSignalField } from '../src/signal-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFieldRoot, RdxSignalField],
    // The field expression is bound exactly ONCE (on `[formField]`); `rdxSignalField` reads it from there.
    // `validationMode="always"` tests the raw bridge mapping eagerly (the default `'onBlur'` would gate it).
    template: `
        <div rdxFieldRoot validationMode="always">
            <input [formField]="name" rdxSignalField />
        </div>
    `
})
class SignalFieldHost {
    readonly model = signal({ name: '' });
    readonly formTree = form(this.model, (path) => {
        required(path.name);
    });

    get name() {
        return this.formTree.name;
    }
}

describe('RdxSignalField — single [formField] binding bridges Signal Forms state into Field', () => {
    let fixture: ComponentFixture<SignalFieldHost>;
    let host: SignalFieldHost;
    let root: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [SignalFieldHost] });
        fixture = TestBed.createComponent(SignalFieldHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxFieldRoot]')).nativeElement;
    });

    it('reflects the bound field invalid state (required + empty) on the Field root', () => {
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(root.getAttribute('data-valid')).toBeNull();
    });

    it('clears invalid once the field becomes valid', () => {
        host.model.update((value) => ({ ...value, name: 'Ada' }));
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBeNull();
        expect(root.getAttribute('data-valid')).toBe('');
    });

    it('reflects touched on blur of the bound control', () => {
        expect(root.getAttribute('data-touched')).toBeNull();
        const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
        input.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(root.getAttribute('data-touched')).toBe('');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFieldRoot, RdxFieldError, RdxSignalField],
    template: `
        <div rdxFieldRoot>
            <input [formField]="name" rdxSignalField />
            <p #err="rdxFieldError" rdxFieldError>{{ err.messages().join(' ') }}</p>
        </div>
    `
})
class GatedSignalFieldHost {
    readonly model = signal({ name: '' });
    readonly formTree = form(this.model, (path) => {
        required(path.name, { message: 'Required.' });
    });

    get name() {
        return this.formTree.name;
    }
}

describe('RdxSignalField — stays neutral until the field is touched', () => {
    let fixture: ComponentFixture<GatedSignalFieldHost>;
    let host: GatedSignalFieldHost;
    let root: HTMLElement;
    const error = () =>
        (fixture.debugElement.query(By.css('[rdxFieldError]')).nativeElement as HTMLElement).textContent?.trim();

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [GatedSignalFieldHost] });
        fixture = TestBed.createComponent(GatedSignalFieldHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxFieldRoot]')).nativeElement;
    });

    it('emits neither data-valid nor data-invalid while untouched (tri-state neutral), and no error', () => {
        expect(root.getAttribute('data-invalid')).toBeNull();
        expect(root.getAttribute('data-valid')).toBeNull();
        expect(error()).toBe('');
    });

    it('reveals invalid and the error once the field is touched (blur)', () => {
        const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
        input.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(root.getAttribute('data-valid')).toBeNull();
        expect(error()).toBe('Required.');
    });

    it('reveals invalid when the field tree is marked touched (e.g. on submit)', () => {
        host.formTree().markAsTouched();
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(error()).toBe('Required.');
    });

    it('shows data-valid (not neutral) once a touched field becomes valid', () => {
        host.formTree().markAsTouched();
        host.model.update((value) => ({ ...value, name: 'Ada' }));
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBeNull();
        expect(root.getAttribute('data-valid')).toBe('');
        expect(error()).toBe('');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, RdxFieldError, RdxSignalField],
    template: `
        <form (onFormSubmit)="submitted = true" rdxFormRoot>
            <div rdxFieldRoot name="name">
                <input [formField]="name" rdxSignalField />
                <p #err="rdxFieldError" rdxFieldError>{{ err.messages().join(' ') }}</p>
            </div>
        </form>
    `
})
class FormSubmitGateHost {
    submitted = false;
    readonly model = signal({ name: '' });
    readonly formTree = form(this.model, (path) => {
        required(path.name, { message: 'Required.' });
    });

    get name() {
        return this.formTree.name;
    }
}

describe('RdxSignalField — a Form submit attempt reveals a neutral field without touch', () => {
    let fixture: ComponentFixture<FormSubmitGateHost>;
    let host: FormSubmitGateHost;
    let root: HTMLElement;
    const error = () =>
        (fixture.debugElement.query(By.css('[rdxFieldError]')).nativeElement as HTMLElement).textContent?.trim();

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [FormSubmitGateHost] });
        fixture = TestBed.createComponent(FormSubmitGateHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxFieldRoot]')).nativeElement;
    });

    it('is neutral before any submit (no data-valid / data-invalid, no error)', () => {
        expect(root.getAttribute('data-invalid')).toBeNull();
        expect(root.getAttribute('data-valid')).toBeNull();
        expect(error()).toBe('');
    });

    it('keeps the Form display neutral on load but tracks actual invalidity (for the submit guard)', () => {
        // The Form's presentation `data-invalid` stays neutral while its fields are (gated) — it does not
        // leak the gated state. But the Form *knows* it is actually invalid via `anyInvalid()`, which the
        // submit guard reads.
        const formEl = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
        const formRoot = fixture.debugElement.query(By.directive(RdxFormRoot)).injector.get(RdxFormRoot);
        expect(formEl.getAttribute('data-invalid')).toBeNull();
        expect(formRoot.anyInvalid()).toBe(true);
        expect(root.getAttribute('data-invalid')).toBeNull();
        expect(root.getAttribute('data-valid')).toBeNull();
    });

    it('reveals the Form display `data-invalid` after a submit attempt (with its fields)', () => {
        const formEl = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
        formEl.dispatchEvent(new SubmitEvent('submit', { cancelable: true, bubbles: true }));
        fixture.detectChanges();
        expect(formEl.getAttribute('data-invalid')).toBe('');
        expect(root.getAttribute('data-invalid')).toBe('');
    });

    it('reveals invalid + error and blocks onFormSubmit on a pristine invalid submit', () => {
        const formEl = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
        formEl.dispatchEvent(new SubmitEvent('submit', { cancelable: true, bubbles: true }));
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(error()).toBe('Required.');
        expect(host.submitted).toBe(false);
    });

    it('lets a valid submit through and shows data-valid', () => {
        host.model.update((value) => ({ ...value, name: 'Ada' }));
        fixture.detectChanges();
        const formEl = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
        formEl.dispatchEvent(new SubmitEvent('submit', { cancelable: true, bubbles: true }));
        fixture.detectChanges();
        expect(host.submitted).toBe(true);
        expect(root.getAttribute('data-valid')).toBe('');
        expect(error()).toBe('');
    });
});
