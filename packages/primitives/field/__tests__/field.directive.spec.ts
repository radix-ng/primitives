import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div
            [invalid]="invalid"
            [disabled]="disabled"
            [required]="required"
            [dirty]="dirty"
            [touched]="touched"
            [validationMode]="validationMode"
            rdxFieldRoot
        >
            <label rdxFieldLabel>Email</label>
            <input id="email" rdxFieldControl />
            <p id="email-description" rdxFieldDescription>Enter your work email.</p>
            <p id="email-error" [match]="match" rdxFieldError>Email is required.</p>
        </div>
    `,
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError]
})
class TestHostComponent {
    invalid = false;
    disabled = false;
    required = false;
    dirty?: boolean;
    touched?: boolean;
    validationMode: 'always' | 'onChange' | 'onBlur' = 'always';
    match: boolean | string | undefined;
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

    it('lets match=true keep an externally controlled message visible and described', () => {
        fixture.componentInstance.match = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.hasAttribute('data-invalid')).toBe(false);
        expect(error.hasAttribute('hidden')).toBe(false);
        expect(input.getAttribute('aria-describedby')).toBe('email-description email-error');
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

    it.each(['onChange', 'onBlur'] as const)('honors explicitly false interaction overrides in %s mode', (mode) => {
        const host = fixture.componentInstance;
        host.invalid = true;
        host.dirty = false;
        host.touched = false;
        host.validationMode = mode;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        input.value = 'edited';
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();

        expect(root).not.toHaveAttribute('data-dirty');
        expect(root).not.toHaveAttribute('data-touched');
        expect(root).not.toHaveAttribute('data-invalid');

        host.dirty = undefined;
        host.touched = undefined;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root).toHaveAttribute('data-dirty');
        expect(root).toHaveAttribute('data-touched');
        expect(root).toHaveAttribute('data-invalid');
    });

    describe('external state provider', () => {
        let fieldRoot: RdxFieldRoot;

        beforeEach(() => {
            fieldRoot = fixture.debugElement.query(By.directive(RdxFieldRoot)).injector.get(RdxFieldRoot);
        });

        it('lets a provider override the root inputs', () => {
            const invalid = signal(true);
            fieldRoot.registerStateProvider({ invalid: () => invalid() });
            fixture.detectChanges();

            // provider wins even though the `invalid` input is still false
            expect(root.getAttribute('data-invalid')).toBe('');
            expect(root.hasAttribute('data-valid')).toBe(false);

            invalid.set(false);
            fixture.detectChanges();
            expect(root.hasAttribute('data-invalid')).toBe(false);
            expect(root.getAttribute('data-valid')).toBe('');
        });

        it('keeps explicit disability when the adapter is enabled', () => {
            const providerDisabled = signal(false);
            fieldRoot.registerStateProvider({ disabled: providerDisabled });
            fixture.componentInstance.disabled = true;
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();
            expect(input).toBeDisabled();

            fixture.componentInstance.disabled = false;
            providerDisabled.set(true);
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();
            expect(input).toBeDisabled();

            providerDisabled.set(false);
            fixture.detectChanges();
            expect(input).toBeEnabled();
        });

        it('owns provided states while leaving the rest to the DOM heuristic', () => {
            const touched = signal(true);
            fieldRoot.registerStateProvider({ touched: () => touched() });
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
            fieldRoot.registerStateProvider({ touched: () => false });
            fixture.detectChanges();
            expect(root.hasAttribute('data-touched')).toBe(false);
        });

        it('restores self-computation when the provider is cleared', () => {
            const unregister = fieldRoot.registerStateProvider({ invalid: () => true });
            fixture.detectChanges();
            expect(root.getAttribute('data-invalid')).toBe('');
            expect(fieldRoot.hasStateProvider()).toBe(true);

            unregister();
            fixture.detectChanges();
            expect(fieldRoot.hasStateProvider()).toBe(false);
            // back to the `invalid` input (false)
            expect(root.hasAttribute('data-invalid')).toBe(false);
        });

        it('restores the latest remaining live provider', () => {
            const unregisterFirst = fieldRoot.registerStateProvider({ name: () => 'first' });
            const unregisterSecond = fieldRoot.registerStateProvider({ name: () => 'second' });
            expect(fieldRoot.effectiveName()).toBe('second');
            unregisterSecond();
            expect(fieldRoot.effectiveName()).toBe('first');
            unregisterFirst();
            expect(fieldRoot.hasStateProvider()).toBe(false);
        });

        it('skips destroyed providers when a replacement is removed', () => {
            const unregisterFirst = fieldRoot.registerStateProvider({ invalid: () => true });
            const unregisterSecond = fieldRoot.registerStateProvider({ invalid: () => false });
            unregisterFirst();
            fixture.detectChanges();
            expect(fieldRoot.hasStateProvider()).toBe(true);
            expect(root.hasAttribute('data-invalid')).toBe(false);

            unregisterSecond();
            fixture.detectChanges();
            expect(fieldRoot.hasStateProvider()).toBe(false);
            expect(root.hasAttribute('data-invalid')).toBe(false);
        });
    });
});
