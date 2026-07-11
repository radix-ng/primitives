import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RdxFormErrors, RdxFormRoot } from '@radix-ng/primitives/form';
import { beforeEach, describe, expect, it } from 'vitest';
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldRoot } from '../src/field-root';
import { RdxNgControlField } from '../src/ng-control-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        ReactiveFormsModule,
        RdxFormRoot,
        RdxFieldRoot,
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError,
        RdxNgControlField
    ],
    template: `
        <form
            [formGroup]="form"
            [errors]="serverErrors()"
            (onClearErrors)="serverErrors.set($event)"
            validationMode="onBlur"
            rdxFormRoot
        >
            <div data-field="email" name="account.email" rdxFieldRoot required>
                <input id="email" type="email" formControlName="email" rdxFieldControl rdxNgControlField />
                <p id="email-description" rdxFieldDescription>Use your account email.</p>
                <p id="required-error" match="required" rdxFieldError>Email is required.</p>
                <p id="email-error" match="email" rdxFieldError>Enter a valid email address.</p>
            </div>

            <div data-field="username" rdxFieldRoot>
                <input id="username" formControlName="username" rdxFieldControl rdxNgControlField />
                <p id="username-error" #error="rdxFieldError" rdxFieldError>{{ error.messages().join(' ') }}</p>
            </div>

            <button type="reset">Reset</button>
        </form>
    `
})
class ReactiveFieldHost {
    readonly serverErrors = signal<RdxFormErrors>({});
    readonly form = new FormGroup({
        email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
        username: new FormControl('Ada', { nonNullable: true })
    });
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, RdxFieldRoot, RdxFieldControl, RdxFieldError, RdxNgControlField],
    template: `
        <div validationMode="always" rdxFieldRoot>
            <input [formControl]="control" rdxFieldControl rdxNgControlField />
            <p #error="rdxFieldError" match="unavailable" rdxFieldError>{{ error.messages().join(' ') }}</p>
        </div>
    `
})
class AsyncFieldHost {
    private readonly validationResolvers: Array<(errors: ValidationErrors | null) => void> = [];
    readonly control = new FormControl('Ada', {
        nonNullable: true,
        asyncValidators: [
            () =>
                new Promise<ValidationErrors | null>((resolve) => {
                    this.validationResolvers.push(resolve);
                })
        ]
    });

    resolveValidation(errors: ValidationErrors | null): void {
        const resolvers = this.validationResolvers.splice(0);
        resolvers.forEach((resolve) => resolve(errors));
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, RdxFieldRoot, RdxFieldControl, RdxFieldError, RdxNgControlField],
    template: `
        <div validationMode="always" rdxFieldRoot required>
            <input [(ngModel)]="email" name="email" required rdxFieldControl rdxNgControlField />
            <p match="required" rdxFieldError>Email is required.</p>
        </div>
    `
})
class TemplateDrivenFieldHost {
    email = '';
}

describe('RdxNgControlField', () => {
    describe('with Reactive Forms', () => {
        let fixture: ComponentFixture<ReactiveFieldHost>;
        let host: ReactiveFieldHost;
        let form: HTMLFormElement;
        let emailField: HTMLElement;
        let emailInput: HTMLInputElement;
        let usernameField: HTMLElement;
        let usernameInput: HTMLInputElement;

        async function settle(): Promise<void> {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        }

        beforeEach(async () => {
            TestBed.configureTestingModule({ imports: [ReactiveFieldHost] });
            fixture = TestBed.createComponent(ReactiveFieldHost);
            host = fixture.componentInstance;
            await settle();
            form = fixture.nativeElement.querySelector('form');
            emailField = fixture.nativeElement.querySelector('[data-field="email"]');
            emailInput = fixture.nativeElement.querySelector('#email');
            usernameField = fixture.nativeElement.querySelector('[data-field="username"]');
            usernameInput = fixture.nativeElement.querySelector('#username');
        });

        it('keeps actual Angular invalidity neutral until validationMode reveals it', async () => {
            expect(host.form.controls.email.invalid).toBe(true);
            expect(emailField.hasAttribute('data-invalid')).toBe(false);
            expect(emailField.hasAttribute('data-valid')).toBe(false);
            expect(emailInput.getAttribute('aria-invalid')).toBeNull();
            expect(fixture.nativeElement.querySelector('#required-error').hasAttribute('hidden')).toBe(true);

            host.form.controls.email.markAsTouched();
            await settle();

            expect(emailField.getAttribute('data-invalid')).toBe('');
            expect(emailField.getAttribute('data-touched')).toBe('');
            expect(emailInput.getAttribute('aria-invalid')).toBe('true');
            expect(fixture.nativeElement.querySelector('#required-error').hasAttribute('hidden')).toBe(false);
            expect(fixture.nativeElement.querySelector('#email-error').hasAttribute('hidden')).toBe(true);
            expect(emailInput.getAttribute('aria-describedby')).toBe('email-description required-error');
        });

        it('switches match-specific errors by Angular validation key and mirrors dirty/valid state', async () => {
            host.form.controls.email.markAsTouched();
            emailInput.value = 'not-an-email';
            emailInput.dispatchEvent(new Event('input'));
            await settle();

            expect(host.form.controls.email.hasError('email')).toBe(true);
            expect(emailField.getAttribute('data-dirty')).toBe('');
            expect(fixture.nativeElement.querySelector('#required-error').hasAttribute('hidden')).toBe(true);
            expect(fixture.nativeElement.querySelector('#email-error').hasAttribute('hidden')).toBe(false);
            expect(emailInput.getAttribute('aria-describedby')).toBe('email-description email-error');

            emailInput.value = 'ada@example.com';
            emailInput.dispatchEvent(new Event('input'));
            await settle();

            expect(emailField.getAttribute('data-valid')).toBe('');
            expect(emailField.hasAttribute('data-invalid')).toBe(false);
            expect(emailInput.getAttribute('aria-invalid')).toBeNull();
            expect(emailInput.getAttribute('aria-describedby')).toBe('email-description');
        });

        it('infers the field name for server errors and clear-on-edit', async () => {
            host.serverErrors.set({ username: 'That username is already taken.' });
            await settle();

            const fieldRoot = fixture.debugElement
                .queryAll(By.directive(RdxFieldRoot))
                .map((debugElement) => debugElement.injector.get(RdxFieldRoot))
                .find((root) => root.controlId() === 'username');
            expect(fieldRoot?.effectiveName()).toBe('username');
            expect(usernameField.getAttribute('data-invalid')).toBe('');
            expect(fixture.nativeElement.querySelector('#username-error').textContent.trim()).toBe(
                'That username is already taken.'
            );

            usernameInput.value = 'Grace';
            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
            await settle();

            expect(host.serverErrors()).toEqual({});
            expect(usernameField.hasAttribute('data-invalid')).toBe(false);
        });

        it('lets an explicit Field name override the inferred NgControl name', async () => {
            const emailRoot = fixture.debugElement
                .queryAll(By.directive(RdxFieldRoot))
                .map((debugElement) => debugElement.injector.get(RdxFieldRoot))
                .find((root) => root.controlId() === 'email');
            expect(emailRoot?.effectiveName()).toBe('account.email');

            host.serverErrors.set({ email: 'Wrong key.' });
            await settle();
            expect(emailField.hasAttribute('data-invalid')).toBe(false);

            host.serverErrors.set({ 'account.email': 'Server rejected this address.' });
            await settle();
            expect(emailField.getAttribute('data-invalid')).toBe('');
        });

        it('reveals pristine errors on submit and restores neutral interaction state on native reset', async () => {
            emailInput.focus();
            usernameInput.focus();
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            await settle();

            expect(emailField.getAttribute('data-invalid')).toBe('');
            expect(document.activeElement).toBe(emailInput);
            expect(fixture.nativeElement.querySelector('#required-error').hasAttribute('hidden')).toBe(false);

            (fixture.nativeElement.querySelector('button[type="reset"]') as HTMLButtonElement).click();
            await new Promise((resolve) => setTimeout(resolve));
            await settle();

            expect(host.form.controls.email.pristine).toBe(true);
            expect(host.form.controls.email.untouched).toBe(true);
            expect(emailField.hasAttribute('data-invalid')).toBe(false);
            expect(emailField.hasAttribute('data-valid')).toBe(false);
            expect(emailField.hasAttribute('data-dirty')).toBe(false);
            expect(emailField.hasAttribute('data-touched')).toBe(false);
        });
    });

    it('keeps pending and disabled Reactive Forms fields neutral and surfaces async messages', async () => {
        TestBed.configureTestingModule({ imports: [AsyncFieldHost] });
        const fixture = TestBed.createComponent(AsyncFieldHost);
        const host = fixture.componentInstance;
        fixture.detectChanges();
        await Promise.resolve();
        fixture.detectChanges();

        const field = fixture.nativeElement.querySelector('[rdxFieldRoot]') as HTMLElement;
        const error = fixture.nativeElement.querySelector('[rdxFieldError]') as HTMLElement;
        const adapter = fixture.debugElement.query(By.directive(RdxNgControlField)).injector.get(RdxNgControlField);

        expect(host.control.pending).toBe(true);
        expect(field.hasAttribute('data-valid')).toBe(false);
        expect(field.hasAttribute('data-invalid')).toBe(false);

        host.resolveValidation(null);
        await fixture.whenStable();
        fixture.detectChanges();
        expect(field.getAttribute('data-valid')).toBe('');

        host.control.setValue('taken');
        fixture.detectChanges();
        expect(host.control.pending).toBe(true);
        expect(field.hasAttribute('data-valid')).toBe(false);
        expect(field.hasAttribute('data-invalid')).toBe(false);

        host.resolveValidation({ unavailable: { message: 'That value is unavailable.' } });
        await fixture.whenStable();
        fixture.detectChanges();
        expect(field.getAttribute('data-invalid')).toBe('');
        expect(error.hasAttribute('hidden')).toBe(false);
        expect(error.textContent?.trim()).toBe('That value is unavailable.');
        expect(adapter.validationErrors()).toEqual([{ kind: 'unavailable', message: 'That value is unavailable.' }]);

        host.control.disable();
        fixture.detectChanges();
        expect(field.getAttribute('data-disabled')).toBe('');
        expect(field.hasAttribute('data-valid')).toBe(false);
        expect(field.hasAttribute('data-invalid')).toBe(false);
        expect(error.hasAttribute('hidden')).toBe(true);
    });

    it('bridges template-driven validation state and infers the ngModel name', async () => {
        TestBed.configureTestingModule({ imports: [TemplateDrivenFieldHost] });
        const fixture = TestBed.createComponent(TemplateDrivenFieldHost);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const field = fixture.nativeElement.querySelector('[rdxFieldRoot]') as HTMLElement;
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        const fieldRoot = fixture.debugElement.query(By.directive(RdxFieldRoot)).injector.get(RdxFieldRoot);

        expect(fieldRoot.effectiveName()).toBe('email');
        expect(field.getAttribute('data-invalid')).toBe('');

        input.value = 'ada@example.com';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(field.getAttribute('data-valid')).toBe('');
    });
});
