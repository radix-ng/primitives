import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { RdxFieldDescription, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
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
                [readOnly]="readonly()"
                [required]="required()"
                [name]="name()"
                [form]="form()"
                [dir]="dir()"
                [autoSubmit]="autoSubmit()"
                (onValueChange)="onValueChange($event)"
                (onValueInvalid)="onValueInvalid($event)"
                (onValueComplete)="onValueComplete($event)"
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
    readonly form = signal<string | undefined>(undefined);
    readonly dir = signal<'ltr' | 'rtl'>('ltr');
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

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxFieldDescription, RdxFieldLabel, RdxFieldRoot, RdxOtpFieldModule],
    template: `
        <div [disabled]="fieldDisabled()" [required]="fieldRequired()" rdxFieldRoot>
            <label rdxFieldLabel>Verification code</label>
            <p rdxFieldDescription>Enter the code sent to your device.</p>
            <div [disabled]="otpDisabled()" [length]="4" rdxOtpFieldRoot>
                <input rdxOtpFieldInput />
                <input rdxOtpFieldInput />
                <input rdxOtpFieldInput />
                <input rdxOtpFieldInput />
            </div>
        </div>
    `
})
class FieldOtpFieldHost {
    readonly fieldDisabled = signal(false);
    readonly fieldRequired = signal(true);
    readonly otpDisabled = signal(false);
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxOtpFieldModule],
    template: `
        <form>
            <div [(value)]="value" [defaultValue]="defaultValue" [length]="4" validationType="none" rdxOtpFieldRoot>
                <input rdxOtpFieldInput />
                <input rdxOtpFieldInput />
                <input rdxOtpFieldInput />
                <input rdxOtpFieldInput />
            </div>
            <button type="reset">Reset</button>
        </form>
    `
})
class OtpFieldResetHost {
    readonly value = signal('1234');
    readonly defaultValue = '1234';
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxFormRoot, RdxFieldRoot, RdxOtpFieldModule],
    template: `
        <form [errors]="errors()" (onClearErrors)="onClearErrors($event)" rdxFormRoot>
            <div name="code" rdxFieldRoot>
                <div [(value)]="value" [length]="4" validationType="none" rdxOtpFieldRoot>
                    <input rdxOtpFieldInput />
                    <input rdxOtpFieldInput />
                    <input rdxOtpFieldInput />
                    <input rdxOtpFieldInput />
                </div>
            </div>
        </form>
    `
})
class FormErrorOtpFieldHost {
    readonly errors = signal({ code: 'Code expired' });
    readonly onClearErrors = vi.fn();
    readonly value = signal('1234');
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
        expect(slots[0]).toHaveAttribute('maxlength', '4');
        expect(slots.slice(1).every((slot) => !slot.hasAttribute('maxlength'))).toBe(true);
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

    it('distributes multi-character autofill while dropping and reporting invalid characters', () => {
        slots[0].value = '1x2';
        slots[0].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();

        expect(host.value()).toBe('12');
        expect(slots.map((slot) => slot.value).join('')).toBe('12');
        expect(host.onValueInvalid).toHaveBeenCalledWith('1x2');
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[2]);
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

    it('normalizes incoming text before merging it into the current code', () => {
        host.value.set('1303');
        host.normalizeValue.set((value) => value.replace(/[^0-3]/gu, ''));
        fixture.detectChanges();

        slots[1].dispatchEvent(pasteEvent('29'));
        fixture.detectChanges();

        expect(host.value()).toBe('1203');
        expect(host.onValueInvalid).toHaveBeenCalledWith('29');
    });

    it('normalizes typed text before merging it and reports characters dropped by the normalizer', () => {
        host.value.set('1303');
        host.normalizeValue.set((value) => value.replace(/[^0-3]/gu, ''));
        fixture.detectChanges();

        slots[1].value = '29';
        slots[1].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();

        expect(host.value()).toBe('1203');
        expect(host.onValueInvalid).toHaveBeenCalledTimes(1);
        expect(host.onValueInvalid).toHaveBeenCalledWith('29');
    });

    it('reports characters removed by a custom normalizer', () => {
        host.validationType.set('none');
        host.normalizeValue.set((value) => value.replace(/[4-9]/gu, ''));
        fixture.detectChanges();

        slots[0].value = '1209';
        slots[0].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();

        expect(host.value()).toBe('120');
        expect(host.onValueInvalid).toHaveBeenCalledTimes(1);
        expect(host.onValueInvalid).toHaveBeenCalledWith('1209');
    });

    it('keeps focus at the first empty slot and selects a filled character on focus', () => {
        host.value.set('12');
        fixture.detectChanges();

        slots[0].focus();
        expect(slots[0].selectionStart).toBe(0);
        expect(slots[0].selectionEnd).toBe(1);

        slots[0].setSelectionRange(1, 1);
        const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        slots[0].dispatchEvent(mouseDown);
        expect(mouseDown.defaultPrevented).toBe(true);
        expect(slots[0].selectionStart).toBe(0);
        expect(slots[0].selectionEnd).toBe(1);

        slots[3].focus();
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[2]);
    });

    it('restores unchanged slot values and selects them for replacement', () => {
        host.value.set('1234');
        fixture.detectChanges();

        slots[3].focus();
        slots[3].value = '45';
        slots[3].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();

        expect(host.value()).toBe('1234');
        expect(slots[3].value).toBe('4');
        expect(slots[3].selectionStart).toBe(0);
        expect(slots[3].selectionEnd).toBe(1);

        slots[2].focus();
        slots[2].value = 'x';
        slots[2].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();

        expect(slots[2].value).toBe('3');
        expect(slots[2].selectionStart).toBe(0);
        expect(slots[2].selectionEnd).toBe(1);

        slots[2].value = '9';
        slots[2].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();

        expect(host.value()).toBe('1294');
        expect(slots.map((slot) => slot.value).join('')).toBe('1294');
    });

    it('keeps focus on a slot cleared through a native input event', () => {
        host.value.set('1234');
        fixture.detectChanges();
        slots[2].focus();

        slots[2].value = '';
        slots[2].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();

        expect(host.value()).toBe('124');
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[2]);
        expect(slots[2].selectionStart).toBe(0);
        expect(slots[2].selectionEnd).toBe(1);
    });

    it('defers filtering and focus changes until IME composition ends', () => {
        host.validationType.set('none');
        fixture.detectChanges();
        slots[0].focus();

        slots[0].dispatchEvent(new Event('compositionstart', { bubbles: true }));
        slots[0].value = 'あ';
        const firstCompositionInput = new Event('input', { bubbles: true }) as InputEvent;
        Object.defineProperty(firstCompositionInput, 'isComposing', { value: true });
        slots[0].dispatchEvent(firstCompositionInput);

        expect(host.value()).toBe('');
        expect(slots[0].value).toBe('あ');

        slots[0].value = 'あい';
        const finalCompositionInput = new Event('input', { bubbles: true }) as InputEvent;
        Object.defineProperty(finalCompositionInput, 'isComposing', { value: true });
        slots[0].dispatchEvent(finalCompositionInput);
        slots[0].dispatchEvent(new Event('compositionend', { bubbles: true }));
        fixture.detectChanges();

        expect(host.value()).toBe('あい');
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[2]);
        expect(host.onValueChange).toHaveBeenCalledTimes(1);

        slots[0].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        expect(host.value()).toBe('あい');
        expect(host.onValueChange).toHaveBeenCalledTimes(1);
    });

    it('moves focus to the first empty slot when a controlled value shrinks', () => {
        host.value.set('1234');
        fixture.detectChanges();
        slots[3].focus();

        host.value.set('1');
        fixture.detectChanges();

        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[1]);
        expect(slots.map((slot) => slot.tabIndex)).toEqual([-1, 0, -1, -1]);
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

    it('advances paste focus by accepted characters and does not jump for rejected text', () => {
        host.length.set(6);
        host.value.set('123456');
        fixture.detectChanges();
        slots[0].focus();

        slots[0].dispatchEvent(pasteEvent('9 9'));
        fixture.detectChanges();

        expect(host.value()).toBe('993456');
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[2]);

        slots[0].focus();
        slots[0].dispatchEvent(pasteEvent('abc'));
        fixture.detectChanges();

        expect(host.value()).toBe('993456');
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[0]);
    });

    it('prevents native paste when reading clipboard data throws', () => {
        const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
        Object.defineProperty(event, 'clipboardData', {
            value: {
                getData: () => {
                    throw new Error('clipboard unavailable');
                }
            }
        });

        slots[0].dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(host.value()).toBe('');
        expect(slots[0].value).toBe('');
    });

    it('does not complete or auto-submit for a partial paste into a complete value', () => {
        host.value.set('1234');
        host.autoSubmit.set(true);
        fixture.detectChanges();

        slots[0].dispatchEvent(pasteEvent('99'));
        fixture.detectChanges();

        expect(host.value()).toBe('9934');
        expect(host.onValueChange).toHaveBeenCalledWith(
            expect.objectContaining({
                value: '9934',
                eventDetails: expect.objectContaining({ reason: 'input-paste' })
            })
        );
        expect(host.onValueComplete).not.toHaveBeenCalled();
        expect(host.onSubmit).not.toHaveBeenCalled();
    });

    it('does not complete or auto-submit for a rejected paste into a complete value', () => {
        host.value.set('1234');
        host.autoSubmit.set(true);
        fixture.detectChanges();

        slots[0].dispatchEvent(pasteEvent('x'));
        fixture.detectChanges();

        expect(host.value()).toBe('1234');
        expect(host.onValueInvalid).toHaveBeenCalledWith('x');
        expect(host.onValueComplete).not.toHaveBeenCalled();
        expect(host.onSubmit).not.toHaveBeenCalled();
    });

    it('completes when a partial paste fills the remaining slots', () => {
        host.value.set('12');
        fixture.detectChanges();

        slots[2].dispatchEvent(pasteEvent('34'));
        fixture.detectChanges();

        expect(host.value()).toBe('1234');
        expect(host.onValueComplete).toHaveBeenCalledWith(
            expect.objectContaining({ value: '1234', reason: 'input-paste' })
        );
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

    it('supports deletion, arrow/Home/End navigation, and control shortcuts', () => {
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
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[1]);

        slots[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[1]);
        slots[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[0]);
        slots[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[3]);

        slots[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[0]);
        slots[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[3]);

        slots[3].dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: true, bubbles: true, cancelable: true })
        );
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[0]);
        slots[0].dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowRight', metaKey: true, bubbles: true, cancelable: true })
        );
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[3]);

        const clearAll = new KeyboardEvent('keydown', {
            key: 'Backspace',
            ctrlKey: true,
            bubbles: true,
            cancelable: true
        });
        slots[3].dispatchEvent(clearAll);
        fixture.detectChanges();
        expect(clearAll.defaultPrevented).toBe(true);
        expect(host.value()).toBe('');
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[0]);
    });

    it('selects the shifted character after Delete', () => {
        host.value.set('1234');
        fixture.detectChanges();
        slots[1].focus();

        slots[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }));
        fixture.detectChanges();

        expect(host.value()).toBe('134');
        expect(slots[1].value).toBe('3');
        expect(slots[1].selectionStart).toBe(0);
        expect(slots[1].selectionEnd).toBe(1);
    });

    it('reverses horizontal key navigation when dir is rtl', () => {
        host.value.set('1234');
        host.dir.set('rtl');
        fixture.detectChanges();
        slots[1].focus();

        slots[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[0]);
        slots[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[1]);

        slots[1].dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true, bubbles: true, cancelable: true })
        );
        expect(fixture.nativeElement.ownerDocument.activeElement).toBe(slots[0]);
        slots[0].dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowLeft', metaKey: true, bubbles: true, cancelable: true })
        );
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
        expect(nativeInput).not.toHaveAttribute('minlength');
        expect(nativeInput).not.toHaveAttribute('maxlength');
        expect(nativeInput.validationMessage).toContain('Enter all 4 characters.');
        expect(root.querySelectorAll('[name="verificationCode"]')).toHaveLength(1);
        expect(new FormData(fixture.nativeElement.querySelector('form')).getAll('verificationCode')).toEqual(['12']);

        host.value.set('1234');
        fixture.detectChanges();
        expect(nativeInput.validationMessage).toBe('');
    });

    it('rejects an incomplete optional value through native form validity', () => {
        host.value.set('12');
        fixture.detectChanges();

        expect(nativeInput.required).toBe(false);
        expect(nativeInput.validity.valid).toBe(false);
        expect(nativeInput.validationMessage).toContain('Enter all 4 characters.');

        host.value.set('');
        fixture.detectChanges();
        expect(nativeInput.validity.valid).toBe(true);
    });

    it('associates each visible slot with an external form', () => {
        const externalForm = fixture.nativeElement.ownerDocument.createElement('form');
        externalForm.id = 'external-otp-form';
        fixture.nativeElement.ownerDocument.body.appendChild(externalForm);
        host.form.set(externalForm.id);
        fixture.detectChanges();

        expect(slots.every((slot) => slot.getAttribute('form') === externalForm.id)).toBe(true);
        expect(slots.every((slot) => slot.form === externalForm)).toBe(true);
        expect(nativeInput.form).toBe(externalForm);

        externalForm.remove();
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
    it('clears a Form server error when a pasted code is committed', () => {
        TestBed.configureTestingModule({ imports: [FormErrorOtpFieldHost] });
        const fixture = TestBed.createComponent(FormErrorOtpFieldHost);
        const host = fixture.componentInstance;
        fixture.detectChanges();
        const slot = fixture.debugElement.query(By.css('[rdxOtpFieldInput]')).nativeElement as HTMLInputElement;

        slot.dispatchEvent(pasteEvent('5678'));

        expect(host.onClearErrors).toHaveBeenCalledTimes(1);
        expect(host.onClearErrors).toHaveBeenCalledWith({});
    });

    it('connects the enclosing Field to the first slot and inherits its disabled and required state', () => {
        TestBed.configureTestingModule({ imports: [FieldOtpFieldHost] });
        const fixture = TestBed.createComponent(FieldOtpFieldHost);
        const host = fixture.componentInstance;
        fixture.detectChanges();
        const root = fixture.debugElement.query(By.css('[rdxOtpFieldRoot]')).nativeElement as HTMLElement;
        const label = fixture.debugElement.query(By.css('[rdxFieldLabel]')).nativeElement as HTMLLabelElement;
        const description = fixture.debugElement.query(By.css('[rdxFieldDescription]')).nativeElement as HTMLElement;
        const slots = fixture.debugElement
            .queryAll(By.css('[rdxOtpFieldInput]'))
            .map((result) => result.nativeElement as HTMLInputElement);
        const nativeInput = fixture.nativeElement.querySelector(
            '[data-rdx-otp-field-native-input]'
        ) as HTMLInputElement;

        expect(label.htmlFor).toBe(slots[0].id);
        expect(slots[0].getAttribute('aria-describedby')).toBe(description.id);
        expect(root.getAttribute('data-required')).toBe('');
        expect(slots[0].required).toBe(true);
        expect(nativeInput.required).toBe(true);

        host.fieldDisabled.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-disabled')).toBe('');
        expect(slots.every((slot) => slot.disabled)).toBe(true);
        expect(nativeInput.disabled).toBe(true);
    });

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

describe('RdxOtpField native form reset', () => {
    it('syncs every slot after a reset button restores the default value', async () => {
        TestBed.configureTestingModule({ imports: [OtpFieldResetHost] });
        const fixture = TestBed.createComponent(OtpFieldResetHost);
        const host = fixture.componentInstance;
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button[type="reset"]') as HTMLButtonElement;
        const slots = fixture.debugElement
            .queryAll(By.css('[rdxOtpFieldInput]'))
            .map((result) => result.nativeElement as HTMLInputElement);

        host.value.set('1239');
        fixture.detectChanges();
        expect(slots.map((slot) => slot.value).join('')).toBe('1239');

        button.click();
        await new Promise((resolve) => setTimeout(resolve));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.value()).toBe('1234');
        expect(slots.map((slot) => slot.value).join('')).toBe('1234');
    });

    it('syncs every slot after form.reset() restores the default value', async () => {
        TestBed.configureTestingModule({ imports: [OtpFieldResetHost] });
        const fixture = TestBed.createComponent(OtpFieldResetHost);
        const host = fixture.componentInstance;
        fixture.detectChanges();
        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        const slots = fixture.debugElement
            .queryAll(By.css('[rdxOtpFieldInput]'))
            .map((result) => result.nativeElement as HTMLInputElement);

        host.value.set('9876');
        fixture.detectChanges();
        expect(slots.map((slot) => slot.value).join('')).toBe('9876');

        form.reset();
        await new Promise((resolve) => setTimeout(resolve));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.value()).toBe('1234');
        expect(slots.map((slot) => slot.value).join('')).toBe('1234');
    });
});
