import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AcceptableValue } from '@radix-ng/primitives/core';
import { RdxFieldError, RdxFieldRoot, RdxNgControlField } from '@radix-ng/primitives/field';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsSelect } from '../index';
import { RdxSelectRoot, RdxSelectValueChangeEvent } from '../src/select-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, _importsSelect],
    template: `
        <div [defaultValue]="'Apple'" [formControl]="control" (onValueChange)="handleValueChange($event)" rdxSelectRoot>
            <button rdxSelectTrigger>
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select…">
                    {{ selectedValue.slotText() }}
                </span>
            </button>
            <div *rdxSelectPortal rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div rdxSelectList>
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxSelectItem>
                                <span rdxSelectItemText>{{ fruit }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class SelectReactiveFormsHost {
    readonly control = new FormControl('Banana', { nonNullable: true });
    readonly cancelNextValue = signal(false);
    readonly fruits = ['Apple', 'Banana'];

    handleValueChange(event: RdxSelectValueChangeEvent): void {
        if (this.cancelNextValue()) {
            event.eventDetails.cancel();
        }
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, _importsSelect],
    template: `
        <div [(ngModel)]="value" required rdxSelectRoot>
            <button rdxSelectTrigger>
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select…">
                    {{ selectedValue.slotText() }}
                </span>
            </button>
            <div *rdxSelectPortal rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div rdxSelectList>
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxSelectItem>
                                <span rdxSelectItemText>{{ fruit }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class SelectTemplateDrivenFormsHost {
    value = 'Banana';
    readonly fruits = ['Apple', 'Banana'];
}

interface Framework {
    id: string;
    label: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, _importsSelect],
    template: `
        <div
            [formControl]="control"
            [isItemEqualToValue]="'id'"
            [itemToStringLabel]="itemToStringLabel"
            multiple
            rdxSelectRoot
        >
            <button rdxSelectTrigger>
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select frameworks…">
                    {{ selectedValue.slotText() }}
                </span>
            </button>
            <div *rdxSelectPortal rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div rdxSelectList>
                        @for (framework of frameworks; track framework.id) {
                            <div [value]="framework" rdxSelectItem>
                                <span rdxSelectItemText>{{ framework.label }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class SelectMultipleReactiveFormsHost {
    readonly frameworks: Framework[] = [
        { id: 'angular', label: 'Angular' },
        { id: 'react', label: 'React' }
    ];
    readonly control = new FormControl<Framework[]>([this.frameworks[0]], { nonNullable: true });
    readonly itemToStringLabel = (framework: Framework) => framework.label;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, RdxFieldRoot, RdxFieldError, RdxNgControlField, _importsSelect],
    template: `
        <div validationMode="always" rdxFieldRoot>
            <div [formControl]="control" rdxSelectRoot rdxNgControlField>
                <button rdxSelectTrigger>
                    <span #selectedValue="rdxSelectedValue" rdxSelectValue>{{ selectedValue.slotText() }}</span>
                </button>
            </div>
            <p #error="rdxFieldError" rdxFieldError>{{ error.messages().join(' ') }}</p>
        </div>
    `
})
class SelectFieldReactiveFormsHost {
    readonly control = new FormControl('Banana', { nonNullable: true });
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsSelect],
    template: `
        <form id="native-form">
            <ng-container
                #nativeRoot="rdxSelectRoot"
                [(value)]="value"
                [defaultValue]="defaultValue()"
                [disabled]="disabled()"
                [itemToStringValue]="serializeItem"
                [name]="name()"
                rdxSelectRoot
            />
        </form>
        <form id="external-form"></form>
        <div [(value)]="externalValue" form="external-form" name="external" rdxSelectRoot></div>
    `
})
class SelectNativeFormHost {
    readonly nativeRoot = viewChild.required<RdxSelectRoot>('nativeRoot');
    readonly defaultValue = signal<AcceptableValue | AcceptableValue[]>('apple');
    readonly value = signal<AcceptableValue | AcceptableValue[]>('apple');
    readonly name = signal<string | undefined>('fruit');
    readonly disabled = signal(false);
    readonly serializeItem = (item: AcceptableValue) =>
        item !== null && typeof item === 'object' && 'id' in item ? String(item.id) : String(item);
    externalValue = 'pear';
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, _importsSelect],
    template: `
        <form id="reactive-native-form">
            <ng-container #root="rdxSelectRoot" [formControl]="control" name="fruit" rdxSelectRoot />
        </form>
    `
})
class SelectNativeReactiveFormHost {
    readonly control = new FormControl('apple', { nonNullable: true });
    readonly root = viewChild.required<RdxSelectRoot>('root');
}

async function selectPreviousItem(fixture: ComponentFixture<unknown>, settle: () => Promise<void>): Promise<void> {
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxSelectTrigger]');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await settle();
    document
        .querySelector('[rdxSelectPopup]')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await settle();
    document
        .querySelector('[rdxSelectPopup]')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
}

async function selectNextItem(fixture: ComponentFixture<unknown>, settle: () => Promise<void>): Promise<void> {
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxSelectTrigger]');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await settle();
    document
        .querySelector('[rdxSelectPopup]')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await settle();
    document
        .querySelector('[rdxSelectPopup]')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
}

function selectRoot(fixture: ComponentFixture<unknown>): RdxSelectRoot {
    return fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);
}

describe('Select with Reactive Forms', () => {
    let fixture: ComponentFixture<SelectReactiveFormsHost>;
    let host: SelectReactiveFormsHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [SelectReactiveFormsHost] });
        fixture = TestBed.createComponent(SelectReactiveFormsHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('lets the form value win over defaultValue and accepts programmatic writes', async () => {
        expect(selectRoot(fixture).value()).toBe('Banana');

        host.control.setValue('Apple');
        await settle();

        expect(selectRoot(fixture).value()).toBe('Apple');
        expect(fixture.nativeElement.querySelector('[rdxSelectTrigger]').textContent).toContain('Apple');
    });

    it('updates and touches the FormControl from user interaction', async () => {
        await selectPreviousItem(fixture, settle);

        expect(host.control.value).toBe('Apple');
        expect(host.control.dirty).toBe(true);

        fixture.nativeElement.querySelector('[rdxSelectTrigger]').dispatchEvent(new FocusEvent('blur'));
        await settle();

        expect(host.control.touched).toBe(true);
    });

    it('does not notify the FormControl when onValueChange is canceled', async () => {
        host.cancelNextValue.set(true);
        await selectPreviousItem(fixture, settle);

        expect(host.control.value).toBe('Banana');
        expect(host.control.pristine).toBe(true);
    });

    it('merges form-owned disabled state and restores it on enable', async () => {
        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxSelectTrigger]');

        host.control.disable();
        await settle();

        expect(trigger.disabled).toBe(true);
        expect(trigger.getAttribute('data-disabled')).toBe('');

        host.control.enable();
        await settle();

        expect(trigger.disabled).toBe(false);
        expect(trigger.getAttribute('data-disabled')).toBeNull();
    });

    it('restores the visible value when the FormControl resets', async () => {
        await selectPreviousItem(fixture, settle);
        expect(host.control.value).toBe('Apple');

        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxSelectTrigger]');
        trigger.dispatchEvent(new FocusEvent('blur'));
        await settle();
        expect(trigger.getAttribute('data-dirty')).toBe('');
        expect(trigger.getAttribute('data-touched')).toBe('');

        host.control.reset('Banana');
        await settle();

        expect(host.control.value).toBe('Banana');
        expect(host.control.pristine).toBe(true);
        expect(host.control.untouched).toBe(true);
        expect(selectRoot(fixture).value()).toBe('Banana');
        expect(trigger.textContent).toContain('Banana');
        expect(trigger.getAttribute('data-dirty')).toBeNull();
        expect(trigger.getAttribute('data-touched')).toBeNull();
    });

    it('mirrors programmatic dirty and touched transitions from the FormControl', async () => {
        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxSelectTrigger]');

        host.control.markAsDirty();
        host.control.markAsTouched();
        await settle();

        expect(trigger.getAttribute('data-dirty')).toBe('');
        expect(trigger.getAttribute('data-touched')).toBe('');

        host.control.markAsPristine();
        host.control.markAsUntouched();
        await settle();

        expect(trigger.getAttribute('data-dirty')).toBeNull();
        expect(trigger.getAttribute('data-touched')).toBeNull();
    });

    it('mirrors valid, pending, invalid, disabled, and mapped errors from the FormControl', async () => {
        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxSelectTrigger]');
        const root = selectRoot(fixture);

        expect(trigger.getAttribute('data-valid')).toBe('');

        host.control.setErrors({ server: { message: 'Choose another fruit.' } });
        await settle();
        expect(trigger.getAttribute('data-invalid')).toBe('');
        expect(trigger.getAttribute('aria-invalid')).toBe('true');
        expect(root.validationErrors()).toEqual([{ kind: 'server', message: 'Choose another fruit.' }]);

        host.control.markAsPending();
        await settle();
        expect(trigger.getAttribute('data-valid')).toBeNull();
        expect(trigger.getAttribute('data-invalid')).toBeNull();
        expect(trigger.getAttribute('aria-invalid')).toBeNull();

        host.control.setErrors(null);
        await settle();
        expect(trigger.getAttribute('data-valid')).toBe('');

        host.control.disable();
        await settle();
        expect(trigger.getAttribute('data-valid')).toBeNull();
        expect(trigger.getAttribute('data-invalid')).toBeNull();
    });
});

describe('Select native form contract', () => {
    let fixture: ComponentFixture<SelectNativeFormHost>;
    let host: SelectNativeFormHost;

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [SelectNativeFormHost] });
        fixture = TestBed.createComponent(SelectNativeFormHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('serializes scalar and repeated values, honours disabled, and supports an external form', async () => {
        const nativeForm = fixture.nativeElement.querySelector('#native-form') as HTMLFormElement;
        const externalForm = fixture.nativeElement.querySelector('#external-form') as HTMLFormElement;

        expect(new FormData(nativeForm).getAll('fruit')).toEqual(['apple']);
        expect(new FormData(externalForm).getAll('external')).toEqual(['pear']);

        host.value.set(['apple', 'banana']);
        fixture.detectChanges();
        expect(new FormData(nativeForm).getAll('fruit')).toEqual(['apple', 'banana']);

        host.disabled.set(true);
        fixture.detectChanges();
        expect(new FormData(nativeForm).has('fruit')).toBe(false);
    });

    it('serializes object values with itemToStringValue instead of object coercion', () => {
        const nativeForm = fixture.nativeElement.querySelector('#native-form') as HTMLFormElement;

        host.value.set([
            { id: 'angular', label: 'Angular' },
            { id: 'vue', label: 'Vue' }
        ]);
        fixture.detectChanges();

        expect(new FormData(nativeForm).getAll('fruit')).toEqual(['angular', 'vue']);
    });

    it('restores the initial value and interaction state on native reset', async () => {
        const nativeForm = fixture.nativeElement.querySelector('#native-form') as HTMLFormElement;
        const root = host.nativeRoot();

        host.value.set('banana');
        root.formUi.markDirty();
        root.touched.set(true);
        fixture.detectChanges();

        nativeForm.reset();
        await Promise.resolve();
        fixture.detectChanges();

        expect(host.value()).toBe('apple');
        expect(root.formUi.dirtyState()).toBe(false);
        expect(root.formUi.touchedState()).toBe(false);
    });

    it('does not reset the model when the native reset event is canceled', async () => {
        const nativeForm = fixture.nativeElement.querySelector('#native-form') as HTMLFormElement;
        host.value.set('banana');
        fixture.detectChanges();
        nativeForm.addEventListener('reset', (event) => event.preventDefault(), { once: true });

        nativeForm.reset();
        await Promise.resolve();
        fixture.detectChanges();

        expect(host.value()).toBe('banana');
    });
});

describe('Select native reset with Reactive Forms', () => {
    it('resets the FormControl value and interaction state', async () => {
        TestBed.configureTestingModule({ imports: [SelectNativeReactiveFormHost] });
        const fixture = TestBed.createComponent(SelectNativeReactiveFormHost);
        const host = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        host.control.setValue('banana');
        host.control.markAsDirty();
        host.control.markAsTouched();
        fixture.detectChanges();

        (fixture.nativeElement.querySelector('form') as HTMLFormElement).reset();
        await Promise.resolve();
        fixture.detectChanges();

        expect(host.control.value).toBe('apple');
        expect(host.control.pristine).toBe(true);
        expect(host.control.untouched).toBe(true);
        expect(host.root().value()).toBe('apple');
    });
});

describe('Select with template-driven forms', () => {
    let fixture: ComponentFixture<SelectTemplateDrivenFormsHost>;
    let host: SelectTemplateDrivenFormsHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [SelectTemplateDrivenFormsHost] });
        fixture = TestBed.createComponent(SelectTemplateDrivenFormsHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('round-trips values through ngModel', async () => {
        expect(selectRoot(fixture).value()).toBe('Banana');

        await selectPreviousItem(fixture, settle);
        expect(host.value).toBe('Apple');

        host.value = 'Banana';
        fixture.changeDetectorRef.markForCheck();
        await settle();
        expect(selectRoot(fixture).value()).toBe('Banana');
    });

    it('mirrors dirty and touched transitions from ngModel', async () => {
        const control = fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel).control;
        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxSelectTrigger]');

        control.markAsDirty();
        control.markAsTouched();
        await settle();
        expect(trigger.getAttribute('data-dirty')).toBe('');
        expect(trigger.getAttribute('data-touched')).toBe('');

        control.markAsPristine();
        control.markAsUntouched();
        await settle();
        expect(trigger.getAttribute('data-dirty')).toBeNull();
        expect(trigger.getAttribute('data-touched')).toBeNull();
    });

    it('mirrors template-driven validation state', async () => {
        const control = fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel).control;
        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxSelectTrigger]');

        expect(control.valid).toBe(true);
        expect(trigger.getAttribute('data-valid')).toBe('');

        host.value = '';
        fixture.changeDetectorRef.markForCheck();
        await settle();
        expect(control.invalid).toBe(true);
        expect(trigger.getAttribute('data-invalid')).toBe('');
        expect(selectRoot(fixture).validationErrors()).toEqual([{ kind: 'required' }]);

        host.value = 'Apple';
        fixture.changeDetectorRef.markForCheck();
        await settle();
        expect(control.valid).toBe(true);
        expect(trigger.getAttribute('data-valid')).toBe('');
        expect(trigger.getAttribute('data-invalid')).toBeNull();
    });
});

describe('Select multiple object values with Reactive Forms', () => {
    let fixture: ComponentFixture<SelectMultipleReactiveFormsHost>;
    let host: SelectMultipleReactiveFormsHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [SelectMultipleReactiveFormsHost] });
        fixture = TestBed.createComponent(SelectMultipleReactiveFormsHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('preserves object identity and array values through the CVA', async () => {
        expect(selectRoot(fixture).value()).toEqual([host.frameworks[0]]);

        await selectNextItem(fixture, settle);

        expect(host.control.value).toEqual(host.frameworks);

        host.control.setValue([host.frameworks[1]]);
        await settle();
        expect(selectRoot(fixture).value()).toEqual([host.frameworks[1]]);
    });
});

describe('Select with the NgControl Field adapter', () => {
    it('projects compound-root validation state onto Field and its trigger', async () => {
        TestBed.configureTestingModule({ imports: [SelectFieldReactiveFormsHost] });
        const fixture = TestBed.createComponent(SelectFieldReactiveFormsHost);
        const host = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const field = fixture.nativeElement.querySelector('[rdxFieldRoot]') as HTMLElement;
        const trigger = fixture.nativeElement.querySelector('[rdxSelectTrigger]') as HTMLButtonElement;
        const error = fixture.nativeElement.querySelector('[rdxFieldError]') as HTMLElement;

        host.control.setErrors({ server: { message: 'Choose another fruit.' } });
        fixture.detectChanges();

        expect(field.getAttribute('data-invalid')).toBe('');
        expect(trigger.getAttribute('data-invalid')).toBe('');
        expect(trigger.getAttribute('aria-invalid')).toBe('true');
        expect(error.textContent?.trim()).toBe('Choose another fruit.');
    });
});
