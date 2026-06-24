import { ChangeDetectionStrategy, Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { _importsAutocomplete } from '@radix-ng/primitives/autocomplete';
import { checkboxImports } from '@radix-ng/primitives/checkbox';
import { _importsCombobox } from '@radix-ng/primitives/combobox';
import { RdxFieldControl, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { RdxInputDirective } from '@radix-ng/primitives/input';
import { RdxNumberFieldInput, RdxNumberFieldRoot } from '@radix-ng/primitives/number-field';
import { RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective } from '@radix-ng/primitives/radio';
import { _importsSelect } from '@radix-ng/primitives/select';
import { RdxSignalField } from '../src/signal-field';

/**
 * Locks in the tri-state seam at the **visible control** level (not just `rdxFieldRoot`): with the default
 * `validationMode="onBlur"`, a control inside a Field is neutral until touched or the form is submitted —
 * **no `aria-invalid`, no `data-valid`, no `data-invalid`** on the control/trigger/group — then reflects
 * invalid after a (blocked) submit. Covers a control per binding pattern: `rdxFieldControl`/`rdxInput`
 * (field context), select-trigger/radio/switch/checkbox/number-field (own host / base / host-directive),
 * and autocomplete/combobox (input part injecting the field context). date/time-field (segment
 * rendering) and editable (attrs split across area/input) follow the same seam and are covered by their
 * own specs + the type-checked build.
 */

const _importsRadio = [RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective];

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, RdxFieldControl, RdxInputDirective, RdxSignalField],
    template: `
        <form rdxFormRoot>
            <div rdxFieldRoot name="control">
                <input #fieldControl [formField]="f.control" rdxFieldControl rdxSignalField />
            </div>
            <div rdxFieldRoot name="input">
                <input #input [formField]="f.input" rdxInput rdxSignalField />
            </div>
        </form>
    `
})
class TextHost {
    readonly model = signal({ control: '', input: '' });
    readonly f = form(this.model, (path) => {
        required(path.control, { message: 'Required.' });
        required(path.input, { message: 'Required.' });
    });
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, _importsSelect, RdxSignalField],
    template: `
        <form rdxFormRoot>
            <div rdxFieldRoot name="city">
                <button [formField]="f.city" rdxSelectRoot rdxSelectTrigger rdxSignalField>
                    <span rdxSelectValue placeholder="Select…"></span>
                </button>
            </div>
        </form>
    `
})
class SelectHost {
    readonly model = signal<{ city: string }>({ city: '' });
    readonly f = form(this.model, (path) => {
        required(path.city, { message: 'Required.' });
    });
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, _importsRadio, RdxSignalField],
    template: `
        <form rdxFormRoot>
            <div rdxFieldRoot name="plan">
                <div [formField]="f.plan" rdxRadioRoot rdxSignalField>
                    <button rdxRadioItem value="free"><input rdxRadioItemInput /></button>
                </div>
            </div>
        </form>
    `
})
class RadioHost {
    readonly model = signal<{ plan: string | null }>({ plan: null });
    readonly f = form(this.model, (path) => {
        required(path.plan, { message: 'Required.' });
    });
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, checkboxImports, RdxSignalField],
    template: `
        <form rdxFormRoot>
            <div rdxFieldRoot name="picks">
                <div [formField]="f.picks" [allValues]="all" rdxCheckboxGroup rdxSignalField>
                    <div name="a" rdxCheckboxRoot>
                        <button rdxCheckboxButton><span rdxCheckboxIndicator></span></button>
                    </div>
                </div>
            </div>
        </form>
    `
})
class CheckboxGroupHost {
    readonly all = ['a', 'b'];
    readonly model = signal<{ picks: string[] }>({ picks: [] });
    readonly f = form(this.model, (path) => {
        validate(path.picks, (ctx) =>
            ctx.value().length > 0 ? undefined : { kind: 'required', message: 'Required.' }
        );
    });
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, RdxNumberFieldRoot, RdxNumberFieldInput, RdxSignalField],
    template: `
        <form rdxFormRoot>
            <div rdxFieldRoot name="n">
                <div [formField]="f.n" rdxNumberFieldRoot rdxSignalField>
                    <input rdxNumberFieldInput />
                </div>
            </div>
        </form>
    `
})
class NumberFieldHost {
    readonly model = signal<{ n: number | null }>({ n: null });
    readonly f = form(this.model, (path) => {
        required(path.n, { message: 'Required.' });
    });
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, _importsAutocomplete, RdxSignalField],
    template: `
        <form rdxFormRoot>
            <div rdxFieldRoot name="a">
                <div [formField]="f.a" rdxAutocompleteRoot rdxSignalField>
                    <input rdxAutocompleteInput aria-label="a" />
                </div>
            </div>
        </form>
    `
})
class AutocompleteHost {
    readonly model = signal<{ a: string }>({ a: '' });
    readonly f = form(this.model, (path) => {
        required(path.a, { message: 'Required.' });
    });
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFormRoot, RdxFieldRoot, _importsCombobox, RdxSignalField],
    template: `
        <form rdxFormRoot>
            <div rdxFieldRoot name="c">
                <div [formField]="f.c" rdxComboboxRoot rdxSignalField>
                    <input rdxComboboxInput aria-label="c" />
                </div>
            </div>
        </form>
    `
})
class ComboboxHost {
    readonly model = signal<{ c: string | null }>({ c: null });
    readonly f = form(this.model, (path) => {
        required(path.c, { message: 'Required.' });
    });
}

type Case = { name: string; host: Type<unknown>; selector: string };

const cases: Case[] = [
    { name: 'rdxFieldControl', host: TextHost, selector: 'input[rdxFieldControl]' },
    { name: 'rdxInput', host: TextHost, selector: 'input[rdxInput]' },
    { name: 'rdxSelectTrigger', host: SelectHost, selector: '[rdxSelectTrigger]' },
    { name: 'rdxRadioRoot', host: RadioHost, selector: '[rdxRadioRoot]' },
    { name: 'rdxCheckboxGroup', host: CheckboxGroupHost, selector: '[rdxCheckboxGroup]' },
    { name: 'rdxNumberFieldInput', host: NumberFieldHost, selector: 'input[rdxNumberFieldInput]' },
    { name: 'rdxAutocompleteInput', host: AutocompleteHost, selector: 'input[rdxAutocompleteInput]' },
    { name: 'rdxComboboxInput', host: ComboboxHost, selector: 'input[rdxComboboxInput]' }
];

describe('default onBlur — the visible control stays neutral until touched or submit', () => {
    for (const testCase of cases) {
        describe(testCase.name, () => {
            let fixture: ComponentFixture<unknown>;
            let control: HTMLElement;

            const settle = async () => {
                fixture.detectChanges();
                await fixture.whenStable();
                fixture.detectChanges();
            };

            beforeEach(async () => {
                TestBed.configureTestingModule({ imports: [testCase.host] });
                fixture = TestBed.createComponent(testCase.host);
                await settle();
                control = fixture.debugElement.query(By.css(testCase.selector)).nativeElement;
            });

            it('is neutral on load: no aria-invalid, no data-valid, no data-invalid', () => {
                expect(control.getAttribute('aria-invalid')).toBeNull();
                expect(control.getAttribute('data-valid')).toBeNull();
                expect(control.getAttribute('data-invalid')).toBeNull();
            });

            it('reflects invalid on the control after a (blocked) submit', async () => {
                const formEl = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
                formEl.dispatchEvent(new SubmitEvent('submit', { cancelable: true, bubbles: true }));
                await settle();
                expect(control.getAttribute('aria-invalid')).toBe('true');
                expect(control.getAttribute('data-invalid')).toBe('');
                expect(control.getAttribute('data-valid')).toBeNull();
            });
        });
    }
});
