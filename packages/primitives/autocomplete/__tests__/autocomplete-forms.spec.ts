import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete, ReactiveFormsModule],
    template: `
        <div [(open)]="open" [formControl]="control" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Fruit" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Fruits">
                        @for (fruit of fruits(); track fruit) {
                            <div rdxAutocompleteItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class ReactiveHost {
    readonly control = new FormControl('');
    readonly open = signal(false);
    readonly fruits = signal(['Apple', 'Banana', 'Grape']);
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete, FormsModule],
    template: `
        <div [(ngModel)]="value" [(open)]="open" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Fruit" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Fruits">
                        @for (fruit of fruits(); track fruit) {
                            <div rdxAutocompleteItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class TemplateHost {
    value = '';
    readonly open = signal(false);
    readonly fruits = signal(['Apple', 'Banana', 'Grape']);
}

function inputOf(fixture: ComponentFixture<unknown>): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
}
function visibleItems(): HTMLElement[] {
    return Array.from(document.querySelectorAll('[rdxAutocompleteItem]')).filter(
        (el) => !el.hasAttribute('hidden')
    ) as HTMLElement[];
}
function type(el: HTMLInputElement, text: string): void {
    el.value = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('Autocomplete forms', () => {
    describe('reactive forms (value = input string)', () => {
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

        it('writes the typed text into the control', async () => {
            type(inputOf(fixture), 'app');
            await settle();
            expect(host.control.value).toBe('app');
        });

        it('writes the selected item label into the control', async () => {
            host.open.set(true);
            await settle();
            visibleItems()[2].click();
            await settle();
            expect(host.control.value).toBe('Grape');
        });

        it('reflects a programmatic setValue in the input', async () => {
            host.control.setValue('Banana');
            await settle();
            expect(inputOf(fixture).value).toBe('Banana');
        });

        it('propagates disabled state', async () => {
            host.control.disable();
            await settle();
            expect(inputOf(fixture).hasAttribute('disabled')).toBe(true);
        });

        it('reflects valid, pending, invalid, and disabled status on the input', async () => {
            expect(inputOf(fixture).getAttribute('data-valid')).toBe('');

            host.control.setErrors({ server: { message: 'Try another value.' } });
            await settle();
            expect(inputOf(fixture).getAttribute('data-invalid')).toBe('');
            expect(inputOf(fixture).getAttribute('aria-invalid')).toBe('true');

            host.control.markAsPending();
            await settle();
            expect(inputOf(fixture).getAttribute('data-valid')).toBeNull();
            expect(inputOf(fixture).getAttribute('data-invalid')).toBeNull();

            host.control.setErrors(null);
            await settle();
            expect(inputOf(fixture).getAttribute('data-valid')).toBe('');

            host.control.disable();
            await settle();
            expect(inputOf(fixture).getAttribute('data-valid')).toBeNull();
            expect(inputOf(fixture).getAttribute('data-invalid')).toBeNull();
        });
    });

    describe('template-driven forms', () => {
        let fixture: ComponentFixture<TemplateHost>;
        let host: TemplateHost;

        async function settle(): Promise<void> {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        }

        beforeEach(async () => {
            TestBed.configureTestingModule({ imports: [TemplateHost] });
            fixture = TestBed.createComponent(TemplateHost);
            host = fixture.componentInstance;
            await settle();
        });

        it('binds the typed text to ngModel', async () => {
            type(inputOf(fixture), 'gra');
            await settle();
            expect(host.value).toBe('gra');
        });
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete],
    template: `
        <div [(open)]="open" [invalid]="invalid()" [errors]="errors()" [dirty]="dirty()" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Fruit" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Fruits">
                        @for (fruit of fruits(); track fruit) {
                            <div rdxAutocompleteItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class AutocompleteValidationHost {
    readonly open = signal(false);
    readonly invalid = signal(false);
    readonly dirty = signal(false);
    readonly errors = signal<{ kind: string; message?: string }[]>([]);
    readonly fruits = signal(['Apple', 'Banana', 'Grape']);
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete, FormField],
    template: `
        <div [(open)]="open" [formField]="query" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Fruit" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Fruits">
                        @for (fruit of fruits(); track fruit) {
                            <div rdxAutocompleteItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class AutocompleteSignalFormHost {
    readonly open = signal(false);
    readonly model = signal<{ query: string }>({ query: '' });
    readonly formTree = form(this.model);
    readonly fruits = signal(['Apple', 'Banana', 'Grape']);

    get query() {
        return this.formTree.query;
    }
}

describe('Autocomplete validation state (root → input)', () => {
    let fixture: ComponentFixture<AutocompleteValidationHost>;
    let host: AutocompleteValidationHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [AutocompleteValidationHost] });
        fixture = TestBed.createComponent(AutocompleteValidationHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('is valid by default', () => {
        expect(inputOf(fixture).getAttribute('data-valid')).toBe('');
        expect(inputOf(fixture).getAttribute('data-invalid')).toBeNull();
        expect(inputOf(fixture).getAttribute('aria-invalid')).toBeNull();
    });

    it('reflects the root invalid input on the input', async () => {
        host.invalid.set(true);
        await settle();
        expect(inputOf(fixture).getAttribute('data-invalid')).toBe('');
        expect(inputOf(fixture).getAttribute('aria-invalid')).toBe('true');
    });

    it('is invalid when the errors list is non-empty', async () => {
        host.errors.set([{ kind: 'required', message: 'Required.' }]);
        await settle();
        expect(inputOf(fixture).getAttribute('data-invalid')).toBe('');
        expect(inputOf(fixture).getAttribute('aria-invalid')).toBe('true');
    });

    it('marks dirty after a value change', async () => {
        expect(inputOf(fixture).getAttribute('data-dirty')).toBeNull();
        type(inputOf(fixture), 'app');
        await settle();
        expect(inputOf(fixture).getAttribute('data-dirty')).toBe('');
    });

    it('marks touched on input blur', async () => {
        expect(inputOf(fixture).getAttribute('data-touched')).toBeNull();
        inputOf(fixture).dispatchEvent(new FocusEvent('blur'));
        await settle();
        expect(inputOf(fixture).getAttribute('data-touched')).toBe('');
    });
});

describe('Autocomplete with Signal Forms', () => {
    let fixture: ComponentFixture<AutocompleteSignalFormHost>;
    let host: AutocompleteSignalFormHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [AutocompleteSignalFormHost] });
        fixture = TestBed.createComponent(AutocompleteSignalFormHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('reflects the bound field value (FormValueControl)', async () => {
        host.model.update((value) => ({ ...value, query: 'Banana' }));
        await settle();
        expect(inputOf(fixture).value).toBe('Banana');
    });

    it('updates the bound field on typing', async () => {
        type(inputOf(fixture), 'app');
        await settle();
        expect(host.model().query).toBe('app');
    });

    it('resets the value and interaction state through Signal Forms', async () => {
        type(inputOf(fixture), 'app');
        inputOf(fixture).dispatchEvent(new FocusEvent('blur'));
        await settle();
        expect(inputOf(fixture).getAttribute('data-dirty')).toBe('');
        expect(inputOf(fixture).getAttribute('data-touched')).toBe('');

        host.formTree().reset({ query: '' });
        await settle();

        expect(host.model().query).toBe('');
        expect(host.query().dirty()).toBe(false);
        expect(host.query().touched()).toBe(false);
        expect(inputOf(fixture).value).toBe('');
        expect(inputOf(fixture).getAttribute('data-dirty')).toBeNull();
        expect(inputOf(fixture).getAttribute('data-touched')).toBeNull();
    });
});
