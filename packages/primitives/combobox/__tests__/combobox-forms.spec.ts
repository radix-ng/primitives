import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

interface Fruit {
    label: string;
    value: string;
}

const FRUITS: Fruit[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' }
];

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox, ReactiveFormsModule],
    template: `
        <form id="reactive-native-form">
            <div [(open)]="open" [formControl]="control" name="fruit" rdxComboboxRoot>
                <input rdxComboboxInput aria-label="Fruit" />
                <div *rdxComboboxPortal rdxComboboxPositioner>
                    <div rdxComboboxPopup>
                        <div rdxComboboxList aria-label="Fruits">
                            @for (fruit of fruits; track fruit.value) {
                                <div [value]="fruit.value" rdxComboboxItem>{{ fruit.label }}</div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </form>
    `
})
class ReactiveHost {
    readonly control = new FormControl<string | null>(null);
    readonly open = signal(false);
    readonly fruits = FRUITS;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <form id="native-form">
            <div
                [(value)]="value"
                [disabled]="disabled()"
                [itemToStringValue]="serializeFruit"
                multiple
                name="fruit"
                rdxComboboxRoot
            >
                <input rdxComboboxInput aria-label="Fruit" />
            </div>
        </form>
        <form id="external-form"></form>
        <div
            [(value)]="externalValue"
            [itemToStringValue]="serializeFruit"
            form="external-form"
            name="external"
            rdxComboboxRoot
        >
            <input rdxComboboxInput aria-label="External fruit" />
        </div>
        <form id="filter-form">
            <div [(inputValue)]="query" name="query" selectionMode="none" rdxComboboxRoot>
                <input rdxComboboxInput aria-label="Query" />
            </div>
        </form>
    `
})
class ComboboxNativeFormHost {
    readonly value = signal<Fruit[]>(FRUITS);
    readonly disabled = signal(false);
    readonly externalValue = signal<Fruit | null>(FRUITS[1]);
    readonly query = signal('angular');
    readonly serializeFruit = (fruit: Fruit) => fruit.value;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <form id="popup-form">
            <div [(inputValue)]="query" [(open)]="open" name="query" selectionMode="none" rdxComboboxRoot>
                <button rdxComboboxTrigger>Search</button>
                <div *rdxComboboxPortal rdxComboboxPositioner>
                    <div rdxComboboxPopup>
                        <input rdxComboboxInput aria-label="Popup query" />
                    </div>
                </div>
            </div>
        </form>
    `
})
class ComboboxPopupNativeFormHost {
    readonly query = signal('angular');
    readonly open = signal(true);
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox, RdxFieldRoot, RdxLabelDirective],
    template: `
        <div [invalid]="invalid()" [required]="required()" validationMode="always" rdxFieldRoot>
            <label rdxLabel>Fruit</label>
            <div rdxComboboxRoot>
                <input rdxComboboxInput />
            </div>
        </div>
    `
})
class FieldHost {
    readonly invalid = signal(false);
    readonly required = signal(false);
}

describe('Combobox forms integration', () => {
    describe('reactive forms', () => {
        let fixture: ComponentFixture<ReactiveHost>;
        let host: ReactiveHost;

        async function settle(): Promise<void> {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        }

        beforeEach(async () => {
            TestBed.configureTestingModule({ imports: [ReactiveHost] });
            fixture = TestBed.createComponent(ReactiveHost);
            host = fixture.componentInstance;
            await settle();
        });

        it('updates the control when an item is selected', async () => {
            host.open.set(true);
            await settle();
            const items = Array.from(document.querySelectorAll('[rdxComboboxItem]')) as HTMLElement[];
            items[0].click();
            await settle();
            expect(host.control.value).toBe('apple');
        });

        it('reflects a programmatic control value into the selection', async () => {
            host.control.setValue('banana');
            await settle();
            const root = fixture.nativeElement.querySelector('[rdxComboboxRoot]');
            expect(root).toBeTruthy();
            // open and confirm banana is marked selected
            host.open.set(true);
            await settle();
            const banana = (Array.from(document.querySelectorAll('[rdxComboboxItem]')) as HTMLElement[]).find((el) =>
                el.textContent?.includes('Banana')
            )!;
            expect(banana.getAttribute('aria-selected')).toBe('true');
        });

        it('disables the input via setDisabledState', async () => {
            host.control.disable();
            await settle();
            const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
            expect(input.hasAttribute('disabled')).toBe(true);
        });

        it('reflects valid, pending, invalid, and disabled status on the input', async () => {
            const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
            expect(input.getAttribute('data-valid')).toBe('');

            host.control.setErrors({ required: true });
            await settle();
            expect(input.getAttribute('data-invalid')).toBe('');
            expect(input.getAttribute('aria-invalid')).toBe('true');

            host.control.markAsPending();
            await settle();
            expect(input.getAttribute('data-valid')).toBeNull();
            expect(input.getAttribute('data-invalid')).toBeNull();

            host.control.setErrors(null);
            await settle();
            expect(input.getAttribute('data-valid')).toBe('');

            host.control.disable();
            await settle();
            expect(input.getAttribute('data-valid')).toBeNull();
            expect(input.getAttribute('data-invalid')).toBeNull();
        });

        it('resets the FormControl and interaction state from the native form', async () => {
            host.control.setValue('banana');
            host.control.markAsDirty();
            host.control.markAsTouched();
            await settle();

            (fixture.nativeElement.querySelector('form') as HTMLFormElement).reset();
            await Promise.resolve();
            await settle();

            expect(host.control.value).toBeNull();
            expect(host.control.pristine).toBe(true);
            expect(host.control.untouched).toBe(true);
        });
    });

    describe('field integration', () => {
        let fixture: ComponentFixture<FieldHost>;
        let host: FieldHost;

        async function settle(): Promise<void> {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        }

        beforeEach(async () => {
            TestBed.configureTestingModule({ imports: [FieldHost] });
            fixture = TestBed.createComponent(FieldHost);
            host = fixture.componentInstance;
            await settle();
        });

        it('propagates field invalid state to the input', async () => {
            host.invalid.set(true);
            await settle();
            const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
            expect(input.getAttribute('data-invalid')).toBe('');
            expect(input.getAttribute('aria-invalid')).toBe('true');
        });

        it('propagates field required state to the input', async () => {
            host.required.set(true);
            await settle();
            const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
            expect(input.getAttribute('data-required')).toBe('');
            expect(input.getAttribute('aria-required')).toBe('true');
        });
    });
});

describe('Combobox native form contract', () => {
    it('serializes object values, supports external form ownership, and excludes disabled values', () => {
        TestBed.configureTestingModule({ imports: [ComboboxNativeFormHost] });
        const fixture = TestBed.createComponent(ComboboxNativeFormHost);
        const host = fixture.componentInstance;
        fixture.detectChanges();

        const nativeForm = fixture.nativeElement.querySelector('#native-form') as HTMLFormElement;
        const externalForm = fixture.nativeElement.querySelector('#external-form') as HTMLFormElement;
        const filterForm = fixture.nativeElement.querySelector('#filter-form') as HTMLFormElement;
        const inputs = fixture.nativeElement.querySelectorAll('[rdxComboboxInput]') as NodeListOf<HTMLInputElement>;

        expect(new FormData(nativeForm).getAll('fruit')).toEqual(['apple', 'banana']);
        expect(new FormData(externalForm).getAll('external')).toEqual(['banana']);
        expect(new FormData(filterForm).get('query')).toBe('angular');
        expect(inputs[0].name).toBe('');
        expect(inputs[1].form).toBe(externalForm);
        expect(inputs[2].name).toBe('query');

        host.disabled.set(true);
        fixture.detectChanges();
        expect(new FormData(nativeForm).has('fruit')).toBe(false);
    });

    it('uses a hidden entry when the filter-only input is portalled outside the form', async () => {
        TestBed.configureTestingModule({ imports: [ComboboxPopupNativeFormHost] });
        const fixture = TestBed.createComponent(ComboboxPopupNativeFormHost);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const form = fixture.nativeElement.querySelector('#popup-form') as HTMLFormElement;
        const input = document.querySelector('[rdxComboboxInput]') as HTMLInputElement;
        expect(input.name).toBe('');
        expect(new FormData(form).get('query')).toBe('angular');
        expect(form.querySelector('[data-rdx-native-form-control]')).not.toBeNull();
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" [invalid]="invalid()" [errors]="errors()" [dirty]="dirty()" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit.value) {
                            <div [value]="fruit.value" rdxComboboxItem>{{ fruit.label }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class ComboboxValidationHost {
    readonly open = signal(false);
    readonly invalid = signal(false);
    readonly dirty = signal(false);
    readonly errors = signal<{ kind: string; message?: string }[]>([]);
    readonly fruits = FRUITS;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox, FormField],
    template: `
        <div [(open)]="open" [formField]="fruit" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit.value) {
                            <div [value]="fruit.value" rdxComboboxItem>{{ fruit.label }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class ComboboxSignalFormHost {
    readonly open = signal(false);
    readonly model = signal<{ fruit: string | null }>({ fruit: null });
    readonly formTree = form(this.model);
    readonly fruits = FRUITS;

    get fruit() {
        return this.formTree.fruit;
    }
}

describe('Combobox validation state (root → input)', () => {
    let fixture: ComponentFixture<ComboboxValidationHost>;
    let host: ComboboxValidationHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function input(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [ComboboxValidationHost] });
        fixture = TestBed.createComponent(ComboboxValidationHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('is valid by default', () => {
        expect(input().getAttribute('data-valid')).toBe('');
        expect(input().getAttribute('data-invalid')).toBeNull();
        expect(input().getAttribute('aria-invalid')).toBeNull();
    });

    it('reflects the root invalid input on the input', async () => {
        host.invalid.set(true);
        await settle();
        expect(input().getAttribute('data-invalid')).toBe('');
        expect(input().getAttribute('aria-invalid')).toBe('true');
    });

    it('is invalid when the errors list is non-empty', async () => {
        host.errors.set([{ kind: 'required', message: 'Required.' }]);
        await settle();
        expect(input().getAttribute('data-invalid')).toBe('');
        expect(input().getAttribute('aria-invalid')).toBe('true');
    });

    it('marks dirty after a value change', async () => {
        expect(input().getAttribute('data-dirty')).toBeNull();
        host.open.set(true);
        await settle();
        (Array.from(document.querySelectorAll('[rdxComboboxItem]')) as HTMLElement[])[0].click();
        await settle();
        expect(input().getAttribute('data-dirty')).toBe('');
    });

    it('marks touched on input blur', async () => {
        expect(input().getAttribute('data-touched')).toBeNull();
        input().dispatchEvent(new FocusEvent('blur'));
        await settle();
        expect(input().getAttribute('data-touched')).toBe('');
    });
});

describe('Combobox with Signal Forms', () => {
    let fixture: ComponentFixture<ComboboxSignalFormHost>;
    let host: ComboboxSignalFormHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [ComboboxSignalFormHost] });
        fixture = TestBed.createComponent(ComboboxSignalFormHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('updates the bound field on item selection (FormValueControl)', async () => {
        host.open.set(true);
        await settle();
        (Array.from(document.querySelectorAll('[rdxComboboxItem]')) as HTMLElement[])[0].click();
        await settle();
        expect(host.model().fruit).toBe('apple');
    });

    it('reflects the bound field value into the selection', async () => {
        host.model.update((value) => ({ ...value, fruit: 'banana' }));
        host.open.set(true);
        await settle();
        const banana = (Array.from(document.querySelectorAll('[rdxComboboxItem]')) as HTMLElement[]).find((el) =>
            el.textContent?.includes('Banana')
        )!;
        expect(banana.getAttribute('aria-selected')).toBe('true');
    });

    it('resets the value and interaction state through Signal Forms', async () => {
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        host.open.set(true);
        await settle();
        (Array.from(document.querySelectorAll('[rdxComboboxItem]')) as HTMLElement[])[0].click();
        await settle();
        expect(input.getAttribute('data-dirty')).toBe('');

        host.formTree().reset({ fruit: null });
        await settle();

        expect(host.model().fruit).toBeNull();
        expect(host.fruit().dirty()).toBe(false);
        expect(host.fruit().touched()).toBe(false);
        expect(input.value).toBe('');
        expect(input.getAttribute('data-dirty')).toBeNull();
        expect(input.getAttribute('data-touched')).toBeNull();
    });
});
