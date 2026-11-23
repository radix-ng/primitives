import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxFieldControl, RdxFieldError, RdxFieldRoot, RdxFieldState } from '@radix-ng/primitives/field';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsForm, RdxFormErrors, RdxFormRoot } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsForm, RdxFieldRoot, RdxFieldControl, RdxFieldError],
    template: `
        <form [errors]="errors()" validationMode="always" rdxFormRoot>
            <div #emailField="rdxFieldRoot" name="email" rdxFieldRoot>
                <input id="email-input" [disabled]="emailDisabled()" name="email" rdxFieldControl />
                <p #emailErr="rdxFieldError" rdxFieldError>{{ emailErr.messages().join(' | ') }}</p>
            </div>
            <div name="" rdxFieldRoot>
                <input id="anon-input" rdxFieldControl />
            </div>
            @if (showOptional()) {
                <div [invalid]="true" name="optional" rdxFieldRoot>
                    <input id="optional-input" rdxFieldControl />
                </div>
            }
        </form>
    `
})
class FieldHost {
    readonly errors = signal<RdxFormErrors | null>(null);
    readonly showOptional = signal(false);
    readonly emailDisabled = signal(false);
}

describe('Field ↔ Form integration', () => {
    let fixture: ComponentFixture<FieldHost>;
    let host: FieldHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function formEl(): HTMLFormElement {
        return fixture.nativeElement.querySelector('form');
    }
    function field(name: string): HTMLElement {
        return fixture.nativeElement.querySelector(`[name="${name}"][rdxFieldRoot]`);
    }
    function emailFieldRoot(): RdxFieldRoot {
        return fixture.debugElement.query(By.directive(RdxFieldRoot)).injector.get(RdxFieldRoot);
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [FieldHost] });
        fixture = TestBed.createComponent(FieldHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('an unnamed field is exempt from server errors', async () => {
        host.errors.set({ email: 'taken' });
        await settle();
        expect(field('email').hasAttribute('data-invalid')).toBe(true);
        expect(field('').hasAttribute('data-invalid')).toBe(false);
    });

    it('server errors override a client-valid field and drive aria-describedby', async () => {
        host.errors.set({ email: 'taken' });
        await settle();

        const input = fixture.nativeElement.querySelector('#email-input') as HTMLInputElement;
        const errorId = field('email').querySelector('[rdxFieldError]')!.getAttribute('id');
        expect(input.getAttribute('aria-describedby')).toContain(errorId);
    });

    it('removing a field unregisters it from the Form aggregate', async () => {
        host.showOptional.set(true);
        await settle();
        expect(formEl().hasAttribute('data-invalid')).toBe(true);

        host.showOptional.set(false);
        await settle();
        expect(formEl().hasAttribute('data-invalid')).toBe(false);
    });

    it('prefers an adapter reporting false interaction state over the Form name fallback', async () => {
        const formRoot = fixture.debugElement.query(By.directive(RdxFormRoot)).injector.get(RdxFormRoot);
        formRoot.setStateProvider({ touchedFor: () => true, dirtyFor: () => true });
        await settle();
        expect(field('email')).toHaveAttribute('data-touched');
        expect(field('email')).toHaveAttribute('data-dirty');

        emailFieldRoot().registerStateProvider({ touched: () => false, dirty: () => false });
        await settle();
        expect(field('email')).not.toHaveAttribute('data-touched');
        expect(field('email')).not.toHaveAttribute('data-dirty');
    });

    it('focuses the next invalid Field when a server error targets a disabled control', async () => {
        host.errors.set({ email: 'taken' });
        host.emailDisabled.set(true);
        host.showOptional.set(true);
        await settle();

        formEl().dispatchEvent(new SubmitEvent('submit', { cancelable: true, bubbles: true }));
        const optional = formEl().querySelector('#optional-input');
        expect(optional).toHaveFocus();
    });

    describe('RdxFieldState.errors accessor', () => {
        it('provider errors force invalid and reach messages() without a Form match', () => {
            const provider: RdxFieldState = { errors: () => [{ kind: 'custom', message: 'Bad value' }] };
            emailFieldRoot().registerStateProvider(provider);
            fixture.detectChanges();

            expect(field('email').hasAttribute('data-invalid')).toBe(true);
            expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('Bad value');
        });

        it('provider errors also force the Form invalid (actual aggregate), not just the field display', () => {
            expect(formEl().hasAttribute('data-invalid')).toBe(false);
            emailFieldRoot().registerStateProvider({ errors: () => [{ kind: 'custom', message: 'Bad value' }] });
            fixture.detectChanges();
            expect(formEl().hasAttribute('data-invalid')).toBe(true);
        });

        it('provider messages precede Form server errors', async () => {
            emailFieldRoot().registerStateProvider({ errors: () => [{ kind: 'custom', message: 'Provider' }] });
            host.errors.set({ email: 'Server' });
            await settle();

            expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('Provider | Server');
        });

        it('falls back to kind when a provider error has no message', () => {
            emailFieldRoot().registerStateProvider({ errors: () => [{ kind: 'required' }] });
            fixture.detectChanges();
            expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('required');
        });

        it('a boolean-only provider leaves invalid resolution unchanged', () => {
            emailFieldRoot().registerStateProvider({ invalid: () => false });
            fixture.detectChanges();
            expect(field('email').hasAttribute('data-invalid')).toBe(false);
            expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('');
        });
    });
});
