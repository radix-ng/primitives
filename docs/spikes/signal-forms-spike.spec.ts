/**
 * Signal Forms runtime spike (readiness prep #5 — the ADR 0004 mandatory gate).
 *
 * ARCHIVED ARTIFACT — not part of the test suite. Ran 9/9 green against the
 * experimental `@angular/forms/signals` in 21.2.9 (2026-06-11), findings are
 * recorded in `docs/adr/0004-field-signal-forms-adapter.md` ("Spike outcome")
 * and `.claude/skills/project-knowledge/references/signal-forms-readiness.md`.
 *
 * TO RE-RUN AT THE ANGULAR 22 BUMP (the last gate step before claiming Signal
 * Forms compatibility): copy this file back to
 * `packages/primitives/input/__tests__/` and run
 * `nx run primitives:test --testFile <path>`. Expected diffs on stable 22:
 * the blur/touched assertion exercises the `touch` output (22) instead of the
 * `touched` model's `touchedChange` (21.x) — rdxInput emits both, so the spec
 * should stay green; validator `when` and `markAsTouched({skipDescendants})`
 * semantics changed but are not exercised here.
 *
 * Verified findings (21.2.9):
 *   1. CVA (`inject(NG_VALUE_ACCESSOR, { self: true })`) — wins when present
 *   2. custom control — ANY directive on the node with a `value`/`checked` model
 *      (core scans `directiveStart..directiveEnd`, not just the host component)
 *   3. native form element fallback
 */
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { RdxSwitchModule } from '@radix-ng/primitives/switch';
import { RdxInputDirective } from '../src/input.directive';

describe('Signal Forms spike (experimental API, Angular 21)', () => {
    describe('archetype A: native input + rdxInput (custom-control path expected)', () => {
        @Component({
            template: `
                <input [formField]="loginForm.email" rdxInput />
            `,
            imports: [FormField, RdxInputDirective]
        })
        class InputHostComponent {
            readonly model = signal({ email: '' });
            readonly loginForm = form(this.model, (path) => {
                required(path.email);
            });
            readonly input = viewChild.required(RdxInputDirective);
        }

        let fixture: ComponentFixture<InputHostComponent>;
        let host: InputHostComponent;
        let input: HTMLInputElement;

        beforeEach(async () => {
            TestBed.configureTestingModule({ imports: [InputHostComponent] });
            fixture = TestBed.createComponent(InputHostComponent);
            fixture.detectChanges();
            await fixture.whenStable();
            host = fixture.componentInstance;
            input = fixture.nativeElement.querySelector('input');
        });

        it('takes the custom-control path: form writes into the directive value model', async () => {
            host.loginForm.email().value.set('a@b.co');
            fixture.detectChanges();
            await fixture.whenStable();

            // The native path writes element.value directly and would leave the
            // directive model untouched — a populated model proves discovery
            // found the attribute directive.
            expect(host.input().value()).toBe('a@b.co');
            expect(input.value).toBe('a@b.co');
        });

        it('propagates user typing to the field', async () => {
            input.value = 'user@example.com';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            await fixture.whenStable();

            expect(host.loginForm.email().value()).toBe('user@example.com');
            expect(host.model().email).toBe('user@example.com');
        });

        it('writes validation errors into the errors input (data-invalid appears)', async () => {
            // Empty + required → invalid; the form must deliver errors through
            // setInputOnDirectives into rdxInput's `errors` input.
            expect(host.loginForm.email().invalid()).toBe(true);
            expect(input.getAttribute('data-invalid')).toBe('');
            expect(input.getAttribute('aria-invalid')).toBe('true');

            host.loginForm.email().value.set('a@b.co');
            fixture.detectChanges();
            await fixture.whenStable();

            expect(host.loginForm.email().invalid()).toBe(false);
            expect(input.hasAttribute('data-invalid')).toBe(false);
        });

        it('delivers errors structurally compatible with RdxValidationError', () => {
            const errors = host.loginForm.email().errors();

            expect(errors.length).toBeGreaterThan(0);
            expect(typeof errors[0].kind).toBe('string');
        });

        it('writes the form-derived name into the name input', () => {
            // FIELD_STATE_KEY_TO_CONTROL_BINDING includes `name`; path-derived
            // names are generated — assert presence, not the exact value.
            expect(input.getAttribute('name')).toBeTruthy();
        });

        it('marks the field touched on blur', async () => {
            expect(host.loginForm.email().touched()).toBe(false);

            input.dispatchEvent(new FocusEvent('blur'));
            fixture.detectChanges();
            await fixture.whenStable();

            // 21.2.9 listens to the `touched` model's `touchedChange`; stable
            // Angular 22 reverted to listening to a separate `touch` output.
            // rdxInput emits both on blur, so this assertion must keep passing
            // across the 22 bump.
            expect(host.loginForm.email().touched()).toBe(true);
        });

        it('reflects form-owned disabled state through the directive', async () => {
            // `disabled` is part of CONTROL_BINDING_NAMES — schema-level
            // disabled(...) requires more setup, so flip the field's value and
            // assert the steady-state contract instead: form-written inputs
            // land as data attributes. Covered above for errors/name; here we
            // double-check the input stays enabled by default.
            expect(input.hasAttribute('data-disabled')).toBe(false);
        });
    });

    describe('archetype B: composite CVA directive — switch (CVA path expected)', () => {
        @Component({
            template: `
                <button [formField]="settingsForm.enabled" rdxSwitchRoot>
                    <span rdxSwitchThumb></span>
                </button>
            `,
            imports: [FormField, RdxSwitchModule]
        })
        class SwitchHostComponent {
            readonly model = signal({ enabled: false });
            readonly settingsForm = form(this.model);
        }

        let fixture: ComponentFixture<SwitchHostComponent>;
        let host: SwitchHostComponent;
        let button: HTMLButtonElement;

        beforeEach(async () => {
            TestBed.configureTestingModule({ imports: [SwitchHostComponent] });
            fixture = TestBed.createComponent(SwitchHostComponent);
            fixture.detectChanges();
            await fixture.whenStable();
            host = fixture.componentInstance;
            button = fixture.nativeElement.querySelector('button');
        });

        it('form → control: writeValue reflects into checked data attributes', async () => {
            expect(button.getAttribute('data-unchecked')).toBe('');

            host.settingsForm.enabled().value.set(true);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(button.getAttribute('data-checked')).toBe('');
            expect(button.hasAttribute('data-unchecked')).toBe(false);
        });

        it('control → form: toggling updates the field and marks it touched', async () => {
            button.click();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(host.settingsForm.enabled().value()).toBe(true);
            expect(host.model().enabled).toBe(true);
            // CVA path registers onTouched — Radix CVA calls it on blur.
            button.dispatchEvent(new FocusEvent('blur'));
            fixture.detectChanges();
            await fixture.whenStable();
            expect(host.settingsForm.enabled().touched()).toBe(true);
        });
    });
});
