import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { beforeEach, describe, expect, it } from 'vitest';

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
        <div rdxComboboxRoot [formControl]="control" [(open)]="open">
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit.value) {
                            <div rdxComboboxItem [value]="fruit.value">{{ fruit.label }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class ReactiveHost {
    readonly control = new FormControl<string | null>(null);
    readonly open = signal(false);
    readonly fruits = FRUITS;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox, RdxFieldRoot, RdxLabelDirective],
    template: `
        <div rdxFieldRoot [invalid]="invalid()" [required]="required()">
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

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div rdxComboboxRoot [invalid]="invalid()" [errors]="errors()" [dirty]="dirty()" [(open)]="open">
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit.value) {
                            <div rdxComboboxItem [value]="fruit.value">{{ fruit.label }}</div>
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
        <div rdxComboboxRoot [formField]="fruit" [(open)]="open">
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit.value) {
                            <div rdxComboboxItem [value]="fruit.value">{{ fruit.label }}</div>
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
});
