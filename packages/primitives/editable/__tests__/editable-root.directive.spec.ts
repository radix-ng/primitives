import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { axe } from 'jest-axe';
import { vi } from 'vitest';
import { RdxEditableArea } from '../src/editable-area';
import { RdxEditableCancelTrigger } from '../src/editable-cancel-trigger';
import { RdxEditableEditTrigger } from '../src/editable-edit-trigger';
import { RdxEditableInput } from '../src/editable-input';
import { RdxEditablePreview } from '../src/editable-preview';
import {
    EditableActivationMode,
    EditableSubmitMode,
    RdxEditableRoot,
    RdxEditableValueChangeEvent
} from '../src/editable-root';
import { RdxEditableSubmitTrigger } from '../src/editable-submit-trigger';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxEditableRoot,
        RdxEditableArea,
        RdxEditablePreview,
        RdxEditableInput,
        RdxEditableEditTrigger,
        RdxEditableSubmitTrigger,
        RdxEditableCancelTrigger
    ],
    template: `
        <div
            #root="rdxEditableRoot"
            [(value)]="value"
            [defaultValue]="defaultValue()"
            [submitMode]="submitMode()"
            [activationMode]="activationMode()"
            [disabled]="disabled()"
            [startWithEditMode]="startWithEditMode()"
            (onValueChange)="onValueChange($event)"
            rdxEditableRoot
        >
            <div rdxEditableArea>
                <span rdxEditablePreview>{{ root.value() }}</span>
                <input rdxEditableInput />
            </div>
            @if (!root.isEditing()) {
                <button rdxEditableEditTrigger>Edit</button>
            } @else {
                <button rdxEditableSubmitTrigger>Submit</button>
                <button rdxEditableCancelTrigger>Cancel</button>
            }
        </div>
    `
})
class TestComponent {
    readonly value = signal<string | undefined>('Hello');
    readonly defaultValue = signal<string | undefined>(undefined);
    readonly submitMode = signal<EditableSubmitMode>('blur');
    readonly activationMode = signal<EditableActivationMode>('focus');
    readonly disabled = signal(false);
    readonly startWithEditMode = signal(false);

    onValueChange = vi.fn<(change: RdxEditableValueChangeEvent) => void>();
}

describe('RdxEditable', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;

    const q = <T extends HTMLElement>(selector: string) =>
        fixture.debugElement.query(By.css(selector))?.nativeElement as T | undefined;

    const preview = () => q<HTMLSpanElement>('[rdxEditablePreview]')!;
    const input = () => q<HTMLInputElement>('[rdxEditableInput]')!;
    const editTrigger = () => q<HTMLButtonElement>('[rdxEditableEditTrigger]');
    const submitTrigger = () => q<HTMLButtonElement>('[rdxEditableSubmitTrigger]');
    const cancelTrigger = () => q<HTMLButtonElement>('[rdxEditableCancelTrigger]');

    const type = (text: string) => {
        input().value = text;
        input().dispatchEvent(new Event('input'));
        fixture.detectChanges();
    };

    const key = (key: string) => {
        input().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        fixture.detectChanges();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestComponent] });
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('renders the preview (focusable) and edit trigger, hides the input', () => {
        expect(preview().getAttribute('tabindex')).toBe('0');
        expect(preview().textContent?.trim()).toBe('Hello');
        expect(editTrigger()).toBeTruthy();
        expect(input().hasAttribute('hidden')).toBe(true);
        expect(submitTrigger()).toBeFalsy();
    });

    it('seeds the value from defaultValue', () => {
        component.value.set(undefined);
        component.defaultValue.set('Default');
        fixture.detectChanges();
        expect(component.value()).toBe('Default');
        expect(preview().textContent?.trim()).toBe('Default');
    });

    it('enters edit mode when the edit trigger is clicked', () => {
        editTrigger()!.click();
        fixture.detectChanges();
        expect(input().hasAttribute('hidden')).toBe(false);
        expect(submitTrigger()).toBeTruthy();
        expect(cancelTrigger()).toBeTruthy();
        expect(editTrigger()).toBeFalsy();
    });

    it('enters edit mode on focus when activationMode is "focus"', () => {
        preview().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        fixture.detectChanges();
        expect(submitTrigger()).toBeTruthy();
    });

    it('enters edit mode on double-click when activationMode is "dblclick"', () => {
        component.activationMode.set('dblclick');
        fixture.detectChanges();

        preview().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        fixture.detectChanges();
        expect(submitTrigger()).toBeFalsy();

        preview().dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        fixture.detectChanges();
        expect(submitTrigger()).toBeTruthy();
    });

    it('commits the value and emits onValueChange on submit', () => {
        editTrigger()!.click();
        fixture.detectChanges();
        type('World');

        const submit = submitTrigger()!;
        submit.click();
        fixture.detectChanges();

        expect(component.value()).toBe('World');
        expect(component.onValueChange).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 'World',
                eventDetails: expect.objectContaining({ reason: 'submit', trigger: submit })
            })
        );
        expect(submitTrigger()).toBeFalsy();
        expect(editTrigger()).toBeTruthy();
    });

    it('allows canceling submit before value updates', () => {
        editTrigger()!.click();
        fixture.detectChanges();
        type('World');
        component.onValueChange.mockImplementationOnce((change) => change.eventDetails.cancel());

        submitTrigger()!.click();
        fixture.detectChanges();

        expect(component.value()).toBe('Hello');
        expect(submitTrigger()).toBeTruthy();
    });

    it('discards the edit on cancel', () => {
        editTrigger()!.click();
        fixture.detectChanges();
        type('Discarded');

        cancelTrigger()!.click();
        fixture.detectChanges();

        expect(component.value()).toBe('Hello');
        expect(component.onValueChange).not.toHaveBeenCalled();
        expect(editTrigger()).toBeTruthy();
    });

    it('submits on Enter when submitMode is "enter"', () => {
        component.submitMode.set('enter');
        fixture.detectChanges();
        editTrigger()!.click();
        fixture.detectChanges();
        type('Entered');

        key('Enter');

        expect(component.value()).toBe('Entered');
        expect(component.onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'Entered' }));
    });

    it('does not submit on Enter when submitMode is "blur"', () => {
        editTrigger()!.click();
        fixture.detectChanges();
        type('Typed');

        key('Enter');

        expect(component.value()).toBe('Hello');
    });

    it('cancels on Escape', () => {
        editTrigger()!.click();
        fixture.detectChanges();
        type('Typed');

        key('Escape');

        expect(component.value()).toBe('Hello');
        expect(editTrigger()).toBeTruthy();
    });

    it('starts in edit mode when startWithEditMode is set', () => {
        component.startWithEditMode.set(true);
        fixture.detectChanges();
        expect(submitTrigger()).toBeTruthy();
        expect(editTrigger()).toBeFalsy();
    });

    describe('disabled', () => {
        beforeEach(() => {
            component.disabled.set(true);
            fixture.detectChanges();
        });

        it('marks the edit trigger disabled via native disabled + data-disabled, not aria-disabled', () => {
            const trigger = editTrigger()!;
            expect(trigger.hasAttribute('disabled')).toBe(true);
            expect(trigger.getAttribute('data-disabled')).toBe('');
            expect(trigger.hasAttribute('aria-disabled')).toBe(false);
        });
    });

    describe('aria-label', () => {
        it('applies default labels to the input and triggers', () => {
            expect(input().getAttribute('aria-label')).toBe('editable input');
            expect(editTrigger()!.getAttribute('aria-label')).toBe('edit');

            editTrigger()!.click();
            fixture.detectChanges();
            expect(submitTrigger()!.getAttribute('aria-label')).toBe('submit');
            expect(cancelTrigger()!.getAttribute('aria-label')).toBe('cancel');
        });
    });

    it('restores focus to the preview after submit without re-entering edit mode', async () => {
        editTrigger()!.click();
        fixture.detectChanges();
        await fixture.whenStable();

        type('World');
        submitTrigger()!.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(document.activeElement).toBe(preview());
        // Restoring focus must not re-open the editor.
        expect(submitTrigger()).toBeFalsy();
    });

    it('has no accessibility violations', async () => {
        expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxEditableRoot,
        RdxEditableArea,
        RdxEditablePreview,
        RdxEditableInput,
        RdxEditableEditTrigger,
        RdxEditableSubmitTrigger
    ],
    template: `
        <div
            #root="rdxEditableRoot"
            [(value)]="value"
            [invalid]="invalid()"
            [errors]="errors()"
            [dirty]="dirty()"
            rdxEditableRoot
        >
            <div rdxEditableArea>
                <span rdxEditablePreview>{{ root.value() }}</span>
                <input rdxEditableInput />
            </div>
            @if (!root.isEditing()) {
                <button rdxEditableEditTrigger>Edit</button>
            } @else {
                <button rdxEditableSubmitTrigger>Submit</button>
            }
        </div>
    `
})
class EditableValidationHost {
    readonly value = signal<string | undefined>('Hello');
    readonly invalid = signal(false);
    readonly dirty = signal(false);
    readonly errors = signal<{ kind: string; message?: string }[]>([]);
}

describe('RdxEditable validation state', () => {
    let fixture: ComponentFixture<EditableValidationHost>;
    let host: EditableValidationHost;

    const area = () => fixture.debugElement.query(By.css('[rdxEditableArea]')).nativeElement as HTMLElement;
    const input = () => fixture.debugElement.query(By.css('[rdxEditableInput]')).nativeElement as HTMLInputElement;
    const editTrigger = () =>
        fixture.debugElement.query(By.css('[rdxEditableEditTrigger]')).nativeElement as HTMLButtonElement;
    const submitTrigger = () =>
        fixture.debugElement.query(By.css('[rdxEditableSubmitTrigger]')).nativeElement as HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [EditableValidationHost] });
        fixture = TestBed.createComponent(EditableValidationHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('is valid by default', () => {
        expect(area().getAttribute('data-valid')).toBe('');
        expect(area().getAttribute('data-invalid')).toBeNull();
        expect(input().getAttribute('aria-invalid')).toBeNull();
    });

    it('reflects the invalid input on the area and input', () => {
        host.invalid.set(true);
        fixture.detectChanges();
        expect(area().getAttribute('data-invalid')).toBe('');
        expect(input().getAttribute('aria-invalid')).toBe('true');
    });

    it('is invalid when the errors list is non-empty', () => {
        host.errors.set([{ kind: 'required', message: 'Required.' }]);
        fixture.detectChanges();
        expect(area().getAttribute('data-invalid')).toBe('');
        expect(input().getAttribute('aria-invalid')).toBe('true');
    });

    it('reflects the dirty input', () => {
        expect(area().getAttribute('data-dirty')).toBeNull();
        host.dirty.set(true);
        fixture.detectChanges();
        expect(area().getAttribute('data-dirty')).toBe('');
    });

    it('marks touched on submit, without dirty when the value is unchanged', () => {
        editTrigger().click();
        fixture.detectChanges();
        submitTrigger().click();
        fixture.detectChanges();
        expect(area().getAttribute('data-touched')).toBe('');
        expect(area().getAttribute('data-dirty')).toBeNull();
    });

    it('marks dirty after a value change is submitted', () => {
        editTrigger().click();
        fixture.detectChanges();
        input().value = 'World';
        input().dispatchEvent(new Event('input'));
        fixture.detectChanges();
        submitTrigger().click();
        fixture.detectChanges();
        expect(host.value()).toBe('World');
        expect(area().getAttribute('data-dirty')).toBe('');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxEditableRoot,
        RdxEditableArea,
        RdxEditablePreview,
        RdxEditableInput,
        RdxEditableEditTrigger,
        RdxEditableSubmitTrigger,
        FormField
    ],
    template: `
        <div #root="rdxEditableRoot" [formField]="name" rdxEditableRoot>
            <div rdxEditableArea>
                <span rdxEditablePreview>{{ root.value() }}</span>
                <input rdxEditableInput />
            </div>
            @if (!root.isEditing()) {
                <button rdxEditableEditTrigger>Edit</button>
            } @else {
                <button rdxEditableSubmitTrigger>Submit</button>
            }
        </div>
    `
})
class EditableSignalFormHost {
    readonly model = signal<{ name: string }>({ name: 'Ada' });
    readonly formTree = form(this.model);

    get name() {
        return this.formTree.name;
    }
}

describe('RdxEditable with Signal Forms', () => {
    let fixture: ComponentFixture<EditableSignalFormHost>;
    let host: EditableSignalFormHost;

    const rootValue = () =>
        fixture.debugElement.query(By.directive(RdxEditableRoot)).injector.get(RdxEditableRoot).value();
    const input = () => fixture.debugElement.query(By.css('[rdxEditableInput]')).nativeElement as HTMLInputElement;
    const editTrigger = () =>
        fixture.debugElement.query(By.css('[rdxEditableEditTrigger]')).nativeElement as HTMLButtonElement;
    const submitTrigger = () =>
        fixture.debugElement.query(By.css('[rdxEditableSubmitTrigger]')).nativeElement as HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [EditableSignalFormHost] });
        fixture = TestBed.createComponent(EditableSignalFormHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('reflects the bound field value (FormValueControl)', () => {
        expect(rootValue()).toBe('Ada');
        host.model.update((value) => ({ ...value, name: 'Grace' }));
        fixture.detectChanges();
        expect(rootValue()).toBe('Grace');
    });

    it('updates the bound field on submit', () => {
        editTrigger().click();
        fixture.detectChanges();
        input().value = 'Grace';
        input().dispatchEvent(new Event('input'));
        fixture.detectChanges();
        submitTrigger().click();
        fixture.detectChanges();
        expect(host.model().name).toBe('Grace');
    });
});
