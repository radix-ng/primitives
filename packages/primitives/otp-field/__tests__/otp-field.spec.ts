import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { RdxOtpFieldModule } from '../index';
import { RdxOtpFieldValidationType, RdxOtpFieldValueCompleteEvent } from '../src/types';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxOtpFieldModule],
    template: `
        <form (submit)="onSubmit($event)">
            <label for="verification-code">Verification code</label>
            <div
                id="verification-code"
                [(value)]="value"
                [length]="length()"
                [defaultValue]="defaultValue()"
                [validationType]="validationType()"
                [normalizeValue]="normalizeValue()"
                [mask]="mask()"
                [disabled]="disabled()"
                [readonly]="readonly()"
                [required]="required()"
                [name]="name()"
                [autoSubmit]="autoSubmit()"
                (onValueChange)="onValueChange($event)"
                (valueInvalid)="onValueInvalid($event)"
                (valueComplete)="onValueComplete($event)"
                rdxOtpFieldRoot
            >
                <div>
                    <input rdxOtpFieldInput />
                    <span><input [type]="slotType()" rdxOtpFieldInput /></span>
                </div>
                <input rdxOtpFieldInput />
                <input aria-label="Authentication token character" rdxOtpFieldInput />
                <div rdxOtpFieldSeparator></div>
            </div>
        </form>
    `
})
class OtpFieldHost {
    readonly length = signal(4);
    readonly value = signal('');
    readonly defaultValue = signal<string | undefined>(undefined);
    readonly validationType = signal<RdxOtpFieldValidationType>('numeric');
    readonly normalizeValue = signal<((value: string) => string) | undefined>(undefined);
    readonly slotType = signal<string | undefined>(undefined);
    readonly mask = signal(false);
    readonly disabled = signal(false);
    readonly readonly = signal(false);
    readonly required = signal(false);
    readonly name = signal<string | undefined>('verificationCode');
    readonly autoSubmit = signal(false);
    readonly onValueChange = vi.fn();
    readonly onValueInvalid = vi.fn();
    readonly onValueComplete = vi.fn<(event: RdxOtpFieldValueCompleteEvent) => void>();
    readonly onSubmit = vi.fn((event: Event) => event.preventDefault());
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, RdxOtpFieldModule],
    template: `
        <form>
            <div [formControl]="control" [length]="4" validationType="none" name="code" rdxOtpFieldRoot>
                <input rdxOtpFieldInput />
                <input rdxOtpFieldInput />
                <input rdxOtpFieldInput />
                <input rdxOtpFieldInput />
            </div>
        </form>
    `
})
class ReactiveOtpFieldHost {
    readonly control = new FormControl('AB12', { nonNullable: true });
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxOtpFieldModule],
    template: `
        <div [formField]="code" [length]="4" validationType="numeric" rdxOtpFieldRoot>
            <input rdxOtpFieldInput />
            <input rdxOtpFieldInput />
            <input rdxOtpFieldInput />
            <input rdxOtpFieldInput />
        </div>
    `
})
class SignalOtpFieldHost {
    readonly model = signal({ code: '1234' });
    readonly formTree = form(this.model);

    get code() {
        return this.formTree.code;
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, RdxOtpFieldModule],
    template: `
        <div [(ngModel)]="code" [length]="4" validationType="none" name="code" rdxOtpFieldRoot>
            <input rdxOtpFieldInput />
            <input rdxOtpFieldInput />
            <input rdxOtpFieldInput />
            <input rdxOtpFieldInput />
        </div>
    `
})
class NgModelOtpFieldHost {
    code = 'AB12';
}

function pasteEvent(text: string): ClipboardEvent {
    const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(event, 'clipboardData', {
        value: { getData: (type: string) => (type === 'text/plain' ? text : '') }
    });
    return event;
}

describe('RdxOtpField', () => {
    let fixture: ComponentFixture<OtpFieldHost>;
    let host: OtpFieldHost;
    let root: HTMLElement;
    let slots: HTMLInputElement[];
    let nativeInput: HTMLInputElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [OtpFieldHost] });
        fixture = TestBed.createComponent(OtpFieldHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxOtpFieldRoot]')).nativeElement;
        slots = fixture.debugElement.queryAll(By.css('[rdxOtpFieldInput]')).map((result) => result.nativeElement);
        nativeInput = fixture.nativeElement.querySelector('[data-rdx-otp-field-native-input]');
    });

    it('renders one labeled text input per code point and assigns stable DOM-order ids', () => {
        expect(root.getAttribute('role')).toBe('group');
        expect(slots).toHaveLength(4);
        expect(slots.map((slot) => slot.id)).toEqual([
            'verification-code',
            'verification-code-2',
            'verification-code-3',
            'verification-code-4'
        ]);
        expect(slots[0].labels?.[0]?.textContent).toBe('Verification code');
        expect(slots.slice(1).map((slot) => slot.getAttribute('aria-label'))).toEqual([
            'Character 2 of 4',
            'Character 3 of 4',
            'Authentication token character'
        ]);
        expect(slots.every((slot) => slot.type === 'text')).toBe(true);
        expect(root.hasAttribute('id')).toBe(false);
    });

    it('normalizes default, controlled, and user-entered values', () => {
        host.defaultValue.set('1 2');
        fixture.detectChanges();
        expect(host.value()).toBe('12');
        expect(slots.map((slot) => slot.value).join('')).toBe('12');

        host.value.set('3 4 5 6 7');
        fixture.detectChanges();
        expect(host.value()).toBe('3456');

        slots[0].value = '8';
        slots[0].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        expect(host.value()).toBe('8456');
    });

    it('rejects invalid characters and emits the attempted unnormalized text', () => {
        slots[0].value = 'x';
        slots[0].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();

        expect(host.value()).toBe('');
        expect(slots[0].value).toBe('');
        expect(host.onValueInvalid).toHaveBeenCalledWith('x');
    });

    it('applies an idempotent custom normalizer and still advances focus', () => {
        host.validationType.set('alpha');
        host.normalizeValue.set((value) => value.toUpperCase());
        fixture.detectChanges();

        slots[0].focus();
        slots[0].value = 'a';
        slots[0].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();

        expect(host.value()).toBe('A');
        expect(slots[0].value).toBe('A');
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[1]);
    });

    it('keeps focus at the first empty slot and selects a filled character on focus', () => {
        host.value.set('12');
        fixture.detectChanges();

        slots[0].focus();
        expect(slots[0].selectionStart).toBe(0);
        expect(slots[0].selectionEnd).toBe(1);

        slots[3].focus();
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[2]);
    });

    it('distributes pasted characters and completes after committing the value', () => {
        let valueAtCompletion = '';
        host.onValueComplete.mockImplementation(() => (valueAtCompletion = host.value()));
        const event = pasteEvent('12 34');
        slots[0].dispatchEvent(event);
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(true);
        expect(host.value()).toBe('1234');
        expect(slots.map((slot) => slot.value).join('')).toBe('1234');
        expect(host.onValueChange).toHaveBeenCalledWith(
            expect.objectContaining({
                value: '1234',
                eventDetails: expect.objectContaining({ reason: 'input-paste' })
            })
        );
        expect(host.onValueComplete).toHaveBeenCalledWith(
            expect.objectContaining({ value: '1234', reason: 'input-paste' })
        );
        expect(valueAtCompletion).toBe('1234');
    });

    it('keeps accepted pasted characters and reports characters rejected by validation', () => {
        slots[0].dispatchEvent(pasteEvent('1x234'));
        fixture.detectChanges();

        expect(host.value()).toBe('1234');
        expect(host.onValueInvalid).toHaveBeenCalledWith('1x234');
    });

    it('emits completion for a repeated complete paste without a redundant value change', () => {
        host.value.set('1234');
        fixture.detectChanges();
        host.onValueChange.mockClear();

        slots[0].dispatchEvent(pasteEvent('1234'));
        fixture.detectChanges();

        expect(host.onValueChange).not.toHaveBeenCalled();
        expect(host.onValueComplete).toHaveBeenCalledWith(
            expect.objectContaining({ value: '1234', reason: 'input-paste' })
        );
    });

    it('allows a value change to be canceled before the model changes', () => {
        host.onValueChange.mockImplementationOnce((change: { eventDetails: { cancel(): void } }) =>
            change.eventDetails.cancel()
        );
        slots[0].value = '1';
        slots[0].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();

        expect(host.value()).toBe('');
        expect(slots[0].value).toBe('');
        expect(host.onValueComplete).not.toHaveBeenCalled();
    });

    it('supports deletion and arrow, Home, and End navigation', () => {
        host.value.set('1234');
        fixture.detectChanges();
        slots[2].focus();
        slots[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
        fixture.detectChanges();
        expect(host.value()).toBe('124');
        expect(host.onValueChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
                eventDetails: expect.objectContaining({ reason: 'keyboard' })
            })
        );
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[2]);

        slots[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[1]);
        slots[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[0]);
        slots[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[3]);
    });

    it('keeps the native form value in one hidden text control and applies required validity', () => {
        host.required.set(true);
        host.value.set('12');
        fixture.detectChanges();

        expect(nativeInput.type).toBe('text');
        expect(nativeInput.getAttribute('aria-hidden')).toBe('true');
        expect(nativeInput.name).toBe('verificationCode');
        expect(nativeInput.value).toBe('12');
        expect(nativeInput.required).toBe(true);
        expect(nativeInput.minLength).toBe(4);
        expect(nativeInput.maxLength).toBe(4);
        expect(nativeInput.validationMessage).toContain('Enter all 4 characters.');
        expect(root.querySelectorAll('[name="verificationCode"]')).toHaveLength(1);
        expect(new FormData(fixture.nativeElement.querySelector('form')).getAll('verificationCode')).toEqual(['12']);

        host.value.set('1234');
        fixture.detectChanges();
        expect(nativeInput.validationMessage).toBe('');
    });

    it('uses one-time-code autocomplete only on the first slot and the native control', () => {
        expect(slots.map((slot) => slot.autocomplete)).toEqual(['one-time-code', 'off', 'off', 'off']);
        expect(nativeInput.autocomplete).toBe('one-time-code');
    });

    it('reflects state attributes and respects disabled, readonly, mask, and per-slot type overrides', () => {
        host.mask.set(true);
        fixture.detectChanges();
        expect(slots.map((slot) => slot.type)).toEqual(['password', 'password', 'password', 'password']);

        host.slotType.set('tel');
        fixture.detectChanges();
        expect(slots[1].type).toBe('tel');

        host.value.set('1');
        host.disabled.set(true);
        host.readonly.set(true);
        host.required.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-disabled')).toBe('');
        expect(root.getAttribute('data-readonly')).toBe('');
        expect(root.getAttribute('data-required')).toBe('');
        expect(root.getAttribute('data-filled')).toBe('');
        expect(slots.every((slot) => slot.disabled)).toBe(true);
        expect(slots[0].readOnly).toBe(true);
    });

    it('submits immediately after emitting completion when autoSubmit is enabled', () => {
        host.autoSubmit.set(true);
        fixture.detectChanges();

        slots[0].dispatchEvent(pasteEvent('1234'));
        fixture.detectChanges();

        expect(host.onValueComplete).toHaveBeenCalledTimes(1);
        expect(host.onSubmit).toHaveBeenCalledTimes(1);
        expect(host.onValueComplete.mock.invocationCallOrder[0]).toBeLessThan(
            host.onSubmit.mock.invocationCallOrder[0]
        );
    });

    it('requires a positive integer length', () => {
        host.length.set(0);
        expect(() => fixture.detectChanges()).toThrowError(
            RangeError,
            'RdxOtpFieldRoot length must be a positive integer.'
        );
    });
});

describe('RdxOtpField form integrations', () => {
    it('integrates with Reactive Forms', () => {
        TestBed.configureTestingModule({ imports: [ReactiveOtpFieldHost] });
        const fixture = TestBed.createComponent(ReactiveOtpFieldHost);
        const host = fixture.componentInstance;
        fixture.detectChanges();
        const slots = fixture.debugElement
            .queryAll(By.css('[rdxOtpFieldInput]'))
            .map((result) => result.nativeElement as HTMLInputElement);

        expect(slots.map((slot) => slot.value).join('')).toBe('AB12');
        slots[0].value = 'Z';
        slots[0].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        expect(host.control.value).toBe('ZB12');
    });

    it('integrates with Signal Forms', () => {
        TestBed.configureTestingModule({ imports: [SignalOtpFieldHost] });
        const fixture = TestBed.createComponent(SignalOtpFieldHost);
        const host = fixture.componentInstance;
        fixture.detectChanges();
        const slots = fixture.debugElement
            .queryAll(By.css('[rdxOtpFieldInput]'))
            .map((result) => result.nativeElement as HTMLInputElement);

        expect(slots.map((slot) => slot.value).join('')).toBe('1234');
        slots[0].value = '9';
        slots[0].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        expect(host.model().code).toBe('9234');
    });

    it('integrates with template-driven forms', async () => {
        TestBed.configureTestingModule({ imports: [NgModelOtpFieldHost] });
        const fixture = TestBed.createComponent(NgModelOtpFieldHost);
        const host = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        const slots = fixture.debugElement
            .queryAll(By.css('[rdxOtpFieldInput]'))
            .map((result) => result.nativeElement as HTMLInputElement);

        expect(slots.map((slot) => slot.value).join('')).toBe('AB12');
        slots[0].value = 'Z';
        slots[0].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        expect(host.code).toBe('ZB12');
    });
});
