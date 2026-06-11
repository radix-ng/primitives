import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxFieldControl, RdxFieldError, RdxFieldRoot } from '@radix-ng/primitives/field';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { _importsForm, RdxFormErrors, RdxFormSubmitEvent } from '../index';

@Component({
    imports: [_importsForm, RdxFieldRoot, RdxFieldControl, RdxFieldError],
    template: `
        <form
            [errors]="errors()"
            (onFormSubmit)="submitted.set($event)"
            (onClearErrors)="cleared.set($event)"
            rdxFormRoot
        >
            <div name="email" rdxFieldRoot>
                <input id="email-input" name="email" rdxFieldControl />
                <p #emailErr="rdxFieldError" rdxFieldError>{{ emailErr.messages().join(' ') }}</p>
            </div>
            <div name="password" rdxFieldRoot>
                <input id="password-input" name="password" rdxFieldControl />
                <p #passwordErr="rdxFieldError" rdxFieldError>{{ passwordErr.messages().join(' ') }}</p>
            </div>
            <button type="submit">Submit</button>
        </form>
    `
})
class FormHost {
    readonly errors = signal<RdxFormErrors | null>(null);
    readonly submitted = signal<RdxFormSubmitEvent | null>(null);
    readonly cleared = signal<RdxFormErrors | null>(null);
}

describe('RdxFormRoot', () => {
    let fixture: ComponentFixture<FormHost>;
    let host: FormHost;

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
    function errorText(name: string): string {
        return field(name).querySelector('[rdxFieldError]')!.textContent!.trim();
    }
    function input(id: string): HTMLInputElement {
        return fixture.nativeElement.querySelector(`#${id}`);
    }
    function submit(): void {
        formEl().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [FormHost] });
        fixture = TestBed.createComponent(FormHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('renders with novalidate and provides the context', () => {
        expect(formEl().hasAttribute('novalidate')).toBe(true);
    });

    describe('external errors', () => {
        it('marks the matching field invalid and exposes its messages', async () => {
            host.errors.set({ email: 'Email is already taken' });
            await settle();

            expect(field('email').hasAttribute('data-invalid')).toBe(true);
            expect(field('email').querySelector('[rdxFieldError]')!.hasAttribute('hidden')).toBe(false);
            expect(errorText('email')).toBe('Email is already taken');
            expect(formEl().hasAttribute('data-invalid')).toBe(true);
        });

        it('preserves array messages in order', async () => {
            host.errors.set({ email: ['Too short', 'Must contain @'] });
            await settle();
            expect(errorText('email')).toBe('Too short Must contain @');
        });

        it('ignores names with no matching field', async () => {
            host.errors.set({ nope: 'unmatched' });
            await settle();
            expect(formEl().hasAttribute('data-invalid')).toBe(false);
        });
    });

    describe('clear on edit', () => {
        it('clears only the edited field and emits the remaining map', async () => {
            host.errors.set({ email: 'taken', password: 'weak' });
            await settle();

            input('email-input').dispatchEvent(new Event('input', { bubbles: true }));
            await settle();

            expect(field('email').hasAttribute('data-invalid')).toBe(false);
            expect(field('password').hasAttribute('data-invalid')).toBe(true);
            expect(host.cleared()).toEqual({ password: 'weak' });
        });

        it('does not clear on a programmatic (eventless) write', async () => {
            host.errors.set({ email: 'taken' });
            await settle();

            input('email-input').value = 'typed';
            await settle();

            expect(field('email').hasAttribute('data-invalid')).toBe(true);
        });

        it('restores cleared errors when a new errors object is assigned', async () => {
            host.errors.set({ email: 'taken' });
            await settle();
            input('email-input').dispatchEvent(new Event('input', { bubbles: true }));
            await settle();
            expect(field('email').hasAttribute('data-invalid')).toBe(false);

            host.errors.set({ email: 'still taken' });
            await settle();
            expect(field('email').hasAttribute('data-invalid')).toBe(true);
        });
    });

    describe('submit', () => {
        it('prevents default and emits serialized values when valid', async () => {
            input('email-input').value = 'a@b.c';
            input('password-input').value = 'secret';
            const event = new Event('submit', { bubbles: true, cancelable: true });
            formEl().dispatchEvent(event);
            await settle();

            expect(event.defaultPrevented).toBe(true);
            expect(host.submitted()?.values).toEqual({ email: 'a@b.c', password: 'secret' });
        });

        it('collapses repeated names into arrays', async () => {
            const extra = document.createElement('input');
            extra.name = 'email';
            extra.value = 'second';
            input('email-input').value = 'first';
            formEl().appendChild(extra);
            submit();
            await settle();
            expect(host.submitted()?.values.email).toEqual(['first', 'second']);
        });

        it('blocks submit and focuses the first invalid field', async () => {
            host.errors.set({ password: 'weak' });
            await settle();
            submit();
            await settle();

            expect(host.submitted()).toBeNull();
            expect(document.activeElement).toBe(input('password-input'));
        });
    });

    describe('reset', () => {
        it('clears external errors and emits an empty map', async () => {
            host.errors.set({ email: 'taken' });
            await settle();

            host.cleared.set(null);
            formEl().reset();
            await settle();

            expect(field('email').hasAttribute('data-invalid')).toBe(false);
            expect(host.cleared()).toEqual({});
        });

        it('resets interaction state after a macrotask', async () => {
            const email = input('email-input');
            email.value = 'typed';
            email.dispatchEvent(new Event('input', { bubbles: true }));
            email.dispatchEvent(new Event('focus', { bubbles: true }));
            email.dispatchEvent(new Event('blur', { bubbles: true }));
            await settle();
            expect(field('email').hasAttribute('data-touched')).toBe(true);
            expect(field('email').hasAttribute('data-dirty')).toBe(true);

            formEl().reset();
            await new Promise((resolve) => setTimeout(resolve));
            await settle();

            expect(field('email').hasAttribute('data-touched')).toBe(false);
            expect(field('email').hasAttribute('data-dirty')).toBe(false);
        });
    });

    it('ngSubmit-style native handlers still observe the event (no stopPropagation)', async () => {
        const handler = vi.fn();
        formEl().addEventListener('submit', handler);
        submit();
        await settle();
        expect(handler).toHaveBeenCalled();
    });
});
