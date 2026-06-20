import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxFieldControl, RdxFieldError, RdxFieldRoot } from '@radix-ng/primitives/field';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsForm, RdxFormErrors, RdxFormRoot, RdxFormState, RdxFormSubmitEvent } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsForm, RdxFieldRoot, RdxFieldControl, RdxFieldError],
    template: `
        <form
            [errors]="errors()"
            (onFormSubmit)="submitted.set($event)"
            (onClearErrors)="clearedCount.set(clearedCount() + 1)"
            rdxFormRoot
        >
            <div name="email" rdxFieldRoot>
                <input id="email-input" name="email" rdxFieldControl />
                <p #emailErr="rdxFieldError" rdxFieldError>{{ emailErr.messages().join(' ') }}</p>
            </div>
            <button type="submit">Submit</button>
        </form>
    `
})
class ProviderHost {
    readonly errors = signal<RdxFormErrors | null>(null);
    readonly submitted = signal<RdxFormSubmitEvent | null>(null);
    readonly clearedCount = signal(0);
}

describe('RdxFormState provider seam', () => {
    let fixture: ComponentFixture<ProviderHost>;
    let host: ProviderHost;
    let root: RdxFormRoot;

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
    function submit(): void {
        formEl().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [ProviderHost] });
        fixture = TestBed.createComponent(ProviderHost);
        host = fixture.componentInstance;
        root = fixture.debugElement.query(By.directive(RdxFormRoot)).injector.get(RdxFormRoot);
        await settle();
    });

    it('provider-owned invalid gates submit even when the registry is valid', async () => {
        root.setStateProvider({ invalid: () => true });
        await settle();
        submit();
        await settle();
        expect(host.submitted()).toBeNull();
    });

    it('provider-owned errorsFor reaches the field while the errors input is unset', async () => {
        const provider: RdxFormState = { errorsFor: (name) => (name === 'email' ? ['From provider'] : []) };
        root.setStateProvider(provider);
        await settle();

        expect(field('email').hasAttribute('data-invalid')).toBe(true);
        expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('From provider');
    });

    it('clear-on-edit is inert for provider-owned errors', async () => {
        root.setStateProvider({ errorsFor: () => ['Owned'] });
        await settle();

        fixture.nativeElement.querySelector('#email-input').dispatchEvent(new Event('input', { bubbles: true }));
        await settle();

        expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('Owned');
        expect(host.clearedCount()).toBe(0);
    });

    it('partial ownership: only submitting drives data-submitting; errors keep built-in behavior', async () => {
        root.setStateProvider({ submitting: () => true });
        host.errors.set({ email: 'built-in' });
        await settle();

        expect(formEl().hasAttribute('data-submitting')).toBe(true);
        expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('built-in');
    });

    it('teardown restores built-in error resolution', async () => {
        root.setStateProvider({ errorsFor: () => ['Owned'] });
        host.errors.set({ email: 'built-in' });
        await settle();
        expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('Owned');

        root.setStateProvider(null);
        await settle();
        expect(field('email').querySelector('[rdxFieldError]')!.textContent!.trim()).toBe('built-in');
    });
});
