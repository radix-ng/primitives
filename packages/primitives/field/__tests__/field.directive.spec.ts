import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div
            rdxFieldRoot
            [invalid]="invalid"
            [disabled]="disabled"
            [required]="required"
            [dirty]="dirty"
            [touched]="touched"
        >
            <label rdxFieldLabel>Email</label>
            <input id="email" rdxFieldControl />
            <p id="email-description" rdxFieldDescription>Enter your work email.</p>
            <p id="email-error" rdxFieldError>Email is required.</p>
        </div>
    `,
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError]
})
class TestHostComponent {
    invalid = false;
    disabled = false;
    required = false;
    dirty = false;
    touched = false;
}

describe('Field', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let root: HTMLElement;
    let label: HTMLLabelElement;
    let input: HTMLInputElement;
    let error: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestHostComponent]
        });

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        root = fixture.nativeElement.querySelector('[rdxFieldRoot]');
        label = fixture.nativeElement.querySelector('label');
        input = fixture.nativeElement.querySelector('input');
        error = fixture.nativeElement.querySelector('#email-error');
    });

    it('associates the label with the control', () => {
        expect(input.getAttribute('id')).toBe('email');
        expect(label.getAttribute('for')).toBe('email');
    });

    it('describes the control with description text by default', () => {
        expect(input.getAttribute('aria-describedby')).toBe('email-description');
        expect(error.hasAttribute('hidden')).toBe(true);
    });

    it('adds invalid state and error description when invalid', () => {
        fixture.componentInstance.invalid = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.getAttribute('data-invalid')).toBe('');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.getAttribute('aria-describedby')).toBe('email-description email-error');
        expect(error.hasAttribute('hidden')).toBe(false);
    });

    it('reflects required, disabled, dirty, and touched states', () => {
        fixture.componentInstance.required = true;
        fixture.componentInstance.disabled = true;
        fixture.componentInstance.dirty = true;
        fixture.componentInstance.touched = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.getAttribute('data-required')).toBe('');
        expect(root.getAttribute('data-disabled')).toBe('');
        expect(root.getAttribute('data-dirty')).toBe('');
        expect(root.getAttribute('data-touched')).toBe('');
        expect(input.getAttribute('required')).toBe('');
        expect(input.getAttribute('disabled')).toBe('');
        // A native control conveys these via the native attributes above; the redundant
        // `aria-required`/`aria-disabled` are only emitted on non-native (custom) controls.
        expect(input.getAttribute('aria-required')).toBeNull();
        expect(input.getAttribute('aria-disabled')).toBeNull();
    });

    it('tracks focused and filled states from the control', () => {
        input.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
        expect(root.getAttribute('data-focused')).toBe('');

        input.value = 'hello@example.com';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(root.getAttribute('data-filled')).toBe('');

        input.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(root.hasAttribute('data-focused')).toBe(false);
    });

    describe('external state provider', () => {
        let fieldRoot: RdxFieldRoot;

        beforeEach(() => {
            fieldRoot = fixture.debugElement.query(By.directive(RdxFieldRoot)).injector.get(RdxFieldRoot);
        });

        it('lets a provider override the root inputs', () => {
            const invalid = signal(true);
            fieldRoot.setStateProvider({ invalid: () => invalid() });
            fixture.detectChanges();

            // provider wins even though the `invalid` input is still false
            expect(root.getAttribute('data-invalid')).toBe('');
            expect(root.hasAttribute('data-valid')).toBe(false);

            invalid.set(false);
            fixture.detectChanges();
            expect(root.hasAttribute('data-invalid')).toBe(false);
            expect(root.getAttribute('data-valid')).toBe('');
        });

        it('owns provided states while leaving the rest to the DOM heuristic', () => {
            const touched = signal(true);
            fieldRoot.setStateProvider({ touched: () => touched() });
            fixture.detectChanges();

            // `touched` is provider-owned…
            expect(root.getAttribute('data-touched')).toBe('');

            // …but `filled` still comes from the control's value
            input.value = 'x';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            expect(root.getAttribute('data-filled')).toBe('');
        });

        it('suppresses the DOM-derived value for an owned state', () => {
            // DOM says blurred → touched=true
            input.dispatchEvent(new FocusEvent('blur'));
            fixture.detectChanges();
            expect(root.getAttribute('data-touched')).toBe('');

            // provider asserts not-touched and must win over the DOM value
            fieldRoot.setStateProvider({ touched: () => false });
            fixture.detectChanges();
            expect(root.hasAttribute('data-touched')).toBe(false);
        });

        it('restores self-computation when the provider is cleared', () => {
            fieldRoot.setStateProvider({ invalid: () => true });
            fixture.detectChanges();
            expect(root.getAttribute('data-invalid')).toBe('');
            expect(fieldRoot.hasStateProvider()).toBe(true);

            fieldRoot.setStateProvider(null);
            fixture.detectChanges();
            expect(fieldRoot.hasStateProvider()).toBe(false);
            // back to the `invalid` input (false)
            expect(root.hasAttribute('data-invalid')).toBe(false);
        });

        it('returns the previous provider when replaced', () => {
            const first = { invalid: () => true };
            expect(fieldRoot.setStateProvider(first)).toBeNull();
            expect(fieldRoot.setStateProvider(null)).toBe(first);
        });

        it('clearStateProvider rolls back only when its provider is still active (identity-checked)', () => {
            const a = { invalid: () => true };
            const b = { invalid: () => false };
            expect(fieldRoot.setStateProvider(a)).toBeNull(); // slot = a
            expect(fieldRoot.setStateProvider(b)).toBe(a); // slot = b (a is now stale)

            // a's teardown must NOT clobber b (create-before-destroy on a view swap)
            fieldRoot.clearStateProvider(a, null);
            fixture.detectChanges();
            expect(fieldRoot.hasStateProvider()).toBe(true);
            expect(root.hasAttribute('data-invalid')).toBe(false); // still b → invalid=false

            // b's teardown rolls the slot back to a
            fieldRoot.clearStateProvider(b, a);
            fixture.detectChanges();
            expect(root.getAttribute('data-invalid')).toBe(''); // back to a → invalid=true
        });
    });
});
