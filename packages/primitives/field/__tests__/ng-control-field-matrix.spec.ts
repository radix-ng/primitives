import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RdxAutocompleteInput, RdxAutocompleteRoot } from '@radix-ng/primitives/autocomplete';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxComboboxInput, RdxComboboxRoot } from '@radix-ng/primitives/combobox';
import { RdxInputDirective } from '@radix-ng/primitives/input';
import { RdxNumberFieldInput, RdxNumberFieldRoot } from '@radix-ng/primitives/number-field';
import { RdxRadioGroupDirective, RdxRadioItemDirective } from '@radix-ng/primitives/radio';
import { RdxSelectRoot, RdxSelectTrigger } from '@radix-ng/primitives/select';
import { RdxSliderRoot } from '@radix-ng/primitives/slider';
import { RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToggleGroup } from '@radix-ng/primitives/toggle-group';
import { describe, expect, it } from 'vitest';
import { RdxFieldRoot } from '../src/field-root';
import { RdxNgControlField } from '../src/ng-control-field';

const CONTROL_NAMES = [
    'input',
    'checkbox',
    'checkboxGroup',
    'switch',
    'radio',
    'slider',
    'numberField',
    'toggleGroup',
    'select',
    'combobox',
    'autocomplete'
] as const;

type ControlName = (typeof CONTROL_NAMES)[number];

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        ReactiveFormsModule,
        RdxFieldRoot,
        RdxNgControlField,
        RdxInputDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxGroupDirective,
        RdxSwitchRoot,
        RdxSwitchThumb,
        RdxRadioGroupDirective,
        RdxRadioItemDirective,
        RdxSliderRoot,
        RdxNumberFieldRoot,
        RdxNumberFieldInput,
        RdxToggleGroup,
        RdxToggle,
        RdxSelectRoot,
        RdxSelectTrigger,
        RdxComboboxRoot,
        RdxComboboxInput,
        RdxAutocompleteRoot,
        RdxAutocompleteInput
    ],
    template: `
        <form [formGroup]="form">
            <div data-control="input" rdxFieldRoot>
                <input formControlName="input" rdxInput rdxNgControlField />
            </div>

            <div data-control="checkbox" rdxFieldRoot>
                <div formControlName="checkbox" rdxCheckboxRoot rdxNgControlField>
                    <button rdxCheckboxButton>Checkbox</button>
                </div>
            </div>

            <div data-control="checkboxGroup" rdxFieldRoot>
                <div [allValues]="checkboxValues" formControlName="checkboxGroup" rdxCheckboxGroup rdxNgControlField>
                    <div name="one" rdxCheckboxRoot>
                        <button rdxCheckboxButton>One</button>
                    </div>
                </div>
            </div>

            <div data-control="switch" rdxFieldRoot>
                <button formControlName="switch" rdxNgControlField rdxSwitchRoot>
                    Switch
                    <span rdxSwitchThumb></span>
                </button>
            </div>

            <div data-control="radio" rdxFieldRoot>
                <div formControlName="radio" rdxNgControlField rdxRadioRoot>
                    <button rdxRadioItem value="one">One</button>
                </div>
            </div>

            <div data-control="slider" rdxFieldRoot>
                <div formControlName="slider" rdxNgControlField rdxSliderRoot></div>
            </div>

            <div data-control="numberField" rdxFieldRoot>
                <div formControlName="numberField" rdxNgControlField rdxNumberFieldRoot>
                    <input rdxNumberFieldInput />
                </div>
            </div>

            <div data-control="toggleGroup" rdxFieldRoot>
                <div formControlName="toggleGroup" rdxNgControlField rdxToggleGroup>
                    <button rdxToggle value="one">One</button>
                </div>
            </div>

            <div data-control="select" rdxFieldRoot>
                <div formControlName="select" rdxNgControlField rdxSelectRoot>
                    <button rdxSelectTrigger>Select</button>
                </div>
            </div>

            <div data-control="combobox" rdxFieldRoot>
                <div formControlName="combobox" rdxComboboxRoot rdxNgControlField>
                    <input rdxComboboxInput />
                </div>
            </div>

            <div data-control="autocomplete" rdxFieldRoot>
                <div formControlName="autocomplete" rdxAutocompleteRoot rdxNgControlField>
                    <input rdxAutocompleteInput />
                </div>
            </div>
        </form>
    `
})
class NgControlFieldMatrixHost {
    readonly checkboxValues = ['one'];
    readonly form = new FormGroup({
        input: new FormControl('', { nonNullable: true }),
        checkbox: new FormControl(false, { nonNullable: true }),
        checkboxGroup: new FormControl<string[]>([], { nonNullable: true }),
        switch: new FormControl(false, { nonNullable: true }),
        radio: new FormControl<string | null>(null),
        slider: new FormControl<number | number[]>([25], { nonNullable: true }),
        numberField: new FormControl<number | null>(null),
        toggleGroup: new FormControl<string[]>([], { nonNullable: true }),
        select: new FormControl<string | null>(null),
        combobox: new FormControl<string | null>(null),
        autocomplete: new FormControl('', { nonNullable: true })
    });
}

describe('RdxNgControlField control matrix', () => {
    it('bridges every Reactive Forms control host into Field through the same lifecycle', async () => {
        TestBed.configureTestingModule({ imports: [NgControlFieldMatrixHost] });
        const fixture = TestBed.createComponent(NgControlFieldMatrixHost);
        const host = fixture.componentInstance;

        await settle(fixture);

        const adapters = fixture.debugElement
            .queryAll(By.directive(RdxNgControlField))
            .map((element) => element.injector.get(RdxNgControlField));
        const fields = new Map<ControlName, HTMLElement>(
            CONTROL_NAMES.map((name) => [
                name,
                fixture.nativeElement.querySelector(`[data-control="${name}"]`) as HTMLElement
            ])
        );
        const fieldRoots = fixture.debugElement
            .queryAll(By.directive(RdxFieldRoot))
            .map((element) => element.injector.get(RdxFieldRoot));

        expect(adapters).toHaveLength(CONTROL_NAMES.length);
        expect(fieldRoots.map((field) => field.effectiveName())).toEqual(CONTROL_NAMES);

        for (const field of fields.values()) {
            expect(field.hasAttribute('data-valid')).toBe(false);
            expect(field.hasAttribute('data-invalid')).toBe(false);
        }

        for (const [name, control] of Object.entries(host.form.controls)) {
            control.setErrors({ matrix: { message: `${name} is invalid.` } });
            control.markAsDirty();
            control.markAsTouched();
        }
        await settle(fixture);

        adapters.forEach((adapter, index) => {
            const name = CONTROL_NAMES[index];
            expect(adapter.validationErrors()).toEqual([{ kind: 'matrix', message: `${name} is invalid.` }]);
            expect(fields.get(name)?.getAttribute('data-invalid')).toBe('');
            expect(fields.get(name)?.getAttribute('data-dirty')).toBe('');
            expect(fields.get(name)?.getAttribute('data-touched')).toBe('');
        });

        host.form.disable();
        await settle(fixture);

        for (const field of fields.values()) {
            expect(field.getAttribute('data-disabled')).toBe('');
            expect(field.hasAttribute('data-valid')).toBe(false);
            expect(field.hasAttribute('data-invalid')).toBe(false);
        }

        host.form.enable();
        host.form.reset();
        await settle(fixture);

        for (const field of fields.values()) {
            expect(field.hasAttribute('data-disabled')).toBe(false);
            expect(field.hasAttribute('data-invalid')).toBe(false);
            expect(field.hasAttribute('data-dirty')).toBe(false);
            expect(field.hasAttribute('data-touched')).toBe(false);
        }
    });
});

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}
