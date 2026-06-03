import { _importsForm, RdxFormErrors } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxFieldControl, RdxFieldError, RdxFieldRoot, RdxFieldState } from '@radix-ng/primitives/field';
import { beforeEach, describe, expect, it } from 'vitest';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsForm, RdxFieldRoot, RdxFieldControl, RdxFieldError],
    template: `
        <form rdxFormRoot [errors]="errors()">
            <div #emailField="rdxFieldRoot" name="email" rdxFieldRoot>
                <input id="email-input" name="email" rdxFieldControl />
                <p #emailErr="rdxFieldError" rdxFieldError>{{ emailErr.messages().join(' | ') }}</p>
            </div>
            <div name="" rdxFieldRoot>
                <input id="anon-input" rdxFieldControl />
            </div>
            @if (showOptional()) {
                <div name="optional" rdxFieldRoot [invalid]="true">
                    <input id="optional-input" rdxFieldControl />
                </div>
            }
        </form>
    `
})
class FieldHost {
    readonly errors = signal<RdxFormErrors | null>(null);
    readonly showOptional = signal(false);
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

    it('an unnamed field is exempt from external errors', async () => {
        host.errors.set({ email: 'taken' });
        await settle();
        expect(field('email').hasAttribute('data-invalid')).toBe(true);
        expect(field('').hasAttribute('data-invalid')).toBe(false);
    });

    it('external errors override a client-valid field and drive aria-describedby', async () => {
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

    describe('RdxFieldState.errors accessor', () => {
        it('provider errors force invalid and reach messages() without a Form match', () => {
            const provider: RdxFieldState = { errors: () => [{ kind: 'custom', message: 'Bad value' }] };
            emailFieldRoot().setStateProvider(provider);
            fixture.detectChanges();

            expect(field('email').hasAttribute('data-invalid')).toBe(true);
            expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('Bad value');
        });

        it('provider messages precede Form external messages', async () => {
            emailFieldRoot().setStateProvider({ errors: () => [{ kind: 'custom', message: 'Provider' }] });
            host.errors.set({ email: 'Server' });
            await settle();

            expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('Provider | Server');
        });

        it('falls back to kind when a provider error has no message', () => {
            emailFieldRoot().setStateProvider({ errors: () => [{ kind: 'required' }] });
            fixture.detectChanges();
            expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('required');
        });

        it('a boolean-only provider leaves invalid resolution unchanged', () => {
            emailFieldRoot().setStateProvider({ invalid: () => false });
            fixture.detectChanges();
            expect(field('email').hasAttribute('data-invalid')).toBe(false);
            expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('');
        });
    });
});
