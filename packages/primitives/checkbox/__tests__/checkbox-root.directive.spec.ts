import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import {
    getState,
    isIndeterminate,
    RdxCheckboxCheckedChangeEvent,
    RdxCheckboxRootDirective
} from '../src/checkbox-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxCheckboxRootDirective, RdxCheckboxButtonDirective, RdxCheckboxIndicatorDirective],
    template: `
        <div
            [checked]="checked"
            [indeterminate]="indeterminate"
            [disabled]="disabled"
            [readOnly]="readonly"
            [required]="required"
            (onCheckedChange)="onChange($event)"
            rdxCheckboxRoot
        >
            <button rdxCheckboxButton>
                <span rdxCheckboxIndicator></span>
            </button>
        </div>
    `
})
class CheckboxHost {
    checked = false;
    indeterminate = false;
    disabled = false;
    readonly = false;
    required = false;

    changes: RdxCheckboxCheckedChangeEvent[] = [];

    // Controlled: reflect the change back into the bound value and clear the
    // mixed state, mirroring the recommended consumer pattern.
    onChange(change: RdxCheckboxCheckedChangeEvent): void {
        this.changes.push(change);
        this.checked = change.checked;
        this.indeterminate = false;
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective
    ],
    template: `
        <form>
            <div
                [checked]="checked"
                (onCheckedChange)="checked = $event.checked"
                name="terms"
                value="yes"
                uncheckedValue="no"
                rdxCheckboxRoot
            >
                <button rdxCheckboxButton>
                    <span rdxCheckboxIndicator></span>
                </button>
                <input rdxCheckboxInput />
            </div>
        </form>
    `
})
class CheckboxUncheckedValueHost {
    checked = false;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxCheckboxRootDirective, RdxCheckboxButtonDirective],
    template: `
        <div defaultChecked rdxCheckboxRoot>
            <button rdxCheckboxButton>Default checked</button>
        </div>
    `
})
class CheckboxDefaultCheckedHost {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxCheckboxRootDirective, RdxCheckboxButtonDirective],
    template: `
        <div readOnly rdxCheckboxRoot>
            <button rdxCheckboxButton>Read only</button>
        </div>
    `
})
class CheckboxReadOnlyAliasHost {}

describe('RdxCheckbox', () => {
    let fixture: ComponentFixture<CheckboxHost>;
    let host: CheckboxHost;

    const button = () => fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    const indicator = () => fixture.debugElement.query(By.css('[rdxCheckboxIndicator]')).nativeElement as HTMLElement;

    function setup(
        initial: Partial<Pick<CheckboxHost, 'checked' | 'indeterminate' | 'disabled' | 'readonly' | 'required'>> = {}
    ) {
        fixture = TestBed.createComponent(CheckboxHost);
        host = fixture.componentInstance;
        Object.assign(host, initial);
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [CheckboxHost] });
    });

    describe('helpers', () => {
        it('isIndeterminate', () => {
            expect(isIndeterminate('indeterminate')).toBe(true);
            expect(isIndeterminate(true)).toBe(false);
            expect(isIndeterminate(false)).toBe(false);
        });

        it('getState', () => {
            expect(getState('indeterminate')).toBe('indeterminate');
            expect(getState(true)).toBe('checked');
            expect(getState(false)).toBe('unchecked');
        });
    });

    const root = () => fixture.debugElement.query(By.css('[rdxCheckboxRoot]')).nativeElement as HTMLElement;
    const state = (element: HTMLElement) => {
        if (element.hasAttribute('data-indeterminate')) {
            return 'indeterminate';
        }
        if (element.hasAttribute('data-checked')) {
            return 'checked';
        }
        if (element.hasAttribute('data-unchecked')) {
            return 'unchecked';
        }
        return null;
    };

    describe('aria / data attributes', () => {
        it('starts unchecked', () => {
            setup();
            expect(button().getAttribute('role')).toBe('checkbox');
            expect(button().getAttribute('aria-checked')).toBe('false');
            expect(state(button())).toBe('unchecked');
            expect(indicator().style.display).toBe('none');
        });

        it('exposes Base UI parity attributes on the root', () => {
            setup({ indeterminate: true, disabled: true, readonly: true });
            expect(state(root())).toBe('indeterminate');
            expect(root().getAttribute('data-disabled')).toBe('');
            expect(root().getAttribute('data-readonly')).toBe('');
            expect(root().hasAttribute('data-required')).toBe(false);
        });

        it('exposes data-required on the root', () => {
            setup({ required: true });
            expect(root().getAttribute('data-required')).toBe('');
        });

        it('omits root state attributes when inactive', () => {
            setup({ checked: true });
            expect(state(root())).toBe('checked');
            expect(root().hasAttribute('data-disabled')).toBe(false);
            expect(root().hasAttribute('data-readonly')).toBe(false);
            expect(root().hasAttribute('data-required')).toBe(false);
        });

        it('reflects the checked state', () => {
            setup({ checked: true });
            expect(button().getAttribute('aria-checked')).toBe('true');
            expect(state(button())).toBe('checked');
            expect(indicator().style.display).not.toBe('none');
        });

        it('reflects the indeterminate state as aria-checked="mixed"', () => {
            setup({ indeterminate: true });
            expect(button().getAttribute('aria-checked')).toBe('mixed');
            expect(state(button())).toBe('indeterminate');
            expect(indicator().style.display).not.toBe('none');
        });

        it('treats indeterminate as orthogonal to checked, with the mixed state taking priority', () => {
            // Base UI shape: `checked` and `indeterminate` are independent booleans.
            setup({ checked: true, indeterminate: true });
            expect(button().getAttribute('aria-checked')).toBe('mixed');
            expect(state(button())).toBe('indeterminate');
            // Indicator is visible for either checked or indeterminate.
            expect(indicator().style.display).not.toBe('none');
        });

        it('exposes aria-required / aria-readonly / aria-disabled', () => {
            setup({ readonly: true, disabled: true });
            expect(button().getAttribute('aria-readonly')).toBe('true');
            expect(button().getAttribute('aria-disabled')).toBe('true');
            expect(button().getAttribute('data-readonly')).toBe('');
            expect(button().getAttribute('data-disabled')).toBe('');
            expect(button().hasAttribute('disabled')).toBe(false);
        });
    });

    describe('toggle()', () => {
        it('unchecked -> checked', () => {
            setup({ checked: false });
            button().click();
            fixture.detectChanges();
            expect(host.checked).toBe(true);
            expect(host.changes.map((change) => change.checked)).toEqual([true]);
            expect(host.changes[0].eventDetails.reason).toBe('none');
        });

        it('checked -> unchecked', () => {
            setup({ checked: true });
            button().click();
            fixture.detectChanges();
            expect(host.checked).toBe(false);
            expect(host.changes.map((change) => change.checked)).toEqual([false]);
        });

        it('indeterminate -> checked (single emit)', () => {
            setup({ indeterminate: true });
            button().click();
            fixture.detectChanges();
            // The fix: indeterminate resolves to `true`, not `false`,
            // and onCheckedChange fires exactly once.
            expect(host.checked).toBe(true);
            expect(host.changes.map((change) => change.checked)).toEqual([true]);
        });

        it('emits once per click across a full cycle', () => {
            setup({ checked: false });
            button().click();
            fixture.detectChanges();
            button().click();
            fixture.detectChanges();
            expect(host.changes.map((change) => change.checked)).toEqual([true, false]);
        });

        it('does not toggle when readonly', () => {
            setup({ checked: false, readonly: true });
            button().click();
            fixture.detectChanges();
            expect(host.checked).toBe(false);
            expect(host.changes).toEqual([]);
        });

        it('does not toggle when disabled', () => {
            setup({ checked: false, disabled: true });
            button().click();
            fixture.detectChanges();
            expect(host.checked).toBe(false);
            expect(host.changes).toEqual([]);
        });
    });

    it('uses defaultChecked for uncontrolled initial state', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ imports: [CheckboxDefaultCheckedHost] });
        const f = TestBed.createComponent(CheckboxDefaultCheckedHost);
        f.detectChanges();
        const defaultButton = f.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

        expect(defaultButton.getAttribute('aria-checked')).toBe('true');
        expect(defaultButton.hasAttribute('data-checked')).toBe(true);
    });

    it('supports the Base UI readOnly input spelling', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ imports: [CheckboxReadOnlyAliasHost] });
        const f = TestBed.createComponent(CheckboxReadOnlyAliasHost);
        f.detectChanges();
        const readOnlyButton = f.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

        readOnlyButton.click();
        f.detectChanges();

        expect(readOnlyButton.getAttribute('aria-readonly')).toBe('true');
        expect(readOnlyButton.getAttribute('aria-checked')).toBe('false');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxCheckboxRootDirective, RdxCheckboxButtonDirective, RdxCheckboxInputDirective],
    template: `
        <div
            [checked]="checked"
            [indeterminate]="indeterminate"
            (onCheckedChange)="checked = $event.checked; indeterminate = false"
            rdxCheckboxRoot
        >
            <button rdxCheckboxButton><span>x</span></button>
            <input rdxCheckboxInput />
        </div>
    `
})
class CheckboxInputHost {
    checked = false;
    indeterminate = false;
}

describe('RdxCheckboxInput (hidden native input)', () => {
    let fixture: ComponentFixture<CheckboxInputHost>;
    let host: CheckboxInputHost;

    const input = () => fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    const button = () => fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    function setup(initial: Partial<Pick<CheckboxInputHost, 'checked' | 'indeterminate'>> = {}) {
        fixture = TestBed.createComponent(CheckboxInputHost);
        host = fixture.componentInstance;
        Object.assign(host, initial);
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [CheckboxInputHost] });
    });

    it('reflects the checked state and stays in sync', () => {
        setup();
        expect(input().hasAttribute('checked')).toBe(false);
        expect(input().checked).toBe(false);
        expect(input().indeterminate).toBe(false);

        host.checked = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(input().getAttribute('checked')).toBe('');
        expect(input().checked).toBe(true);
        expect(input().indeterminate).toBe(false);
    });

    it('does not submit indeterminate as checked, sets the native property', () => {
        setup({ indeterminate: true });
        expect(input().hasAttribute('checked')).toBe(false);
        expect(input().checked).toBe(false);
        expect(input().indeterminate).toBe(true);
    });

    it('emits a bubbling change event on toggle but not on initial render', () => {
        setup();

        let changeCount = 0;
        input().addEventListener('change', () => changeCount++);

        // Initial render must not have emitted.
        expect(changeCount).toBe(0);

        button().click();
        fixture.detectChanges();

        expect(changeCount).toBe(1);
        // No click dispatch -> the input is not toggled out of sync.
        expect(input().checked).toBe(true);
    });
});

describe('RdxCheckboxRoot uncheckedValue', () => {
    let fixture: ComponentFixture<CheckboxUncheckedValueHost>;
    let host: CheckboxUncheckedValueHost;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [CheckboxUncheckedValueHost] });
        fixture = TestBed.createComponent(CheckboxUncheckedValueHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    const form = () => fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
    const button = () => fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    it('submits uncheckedValue when unchecked and the checked value when checked', () => {
        expect(new FormData(form()).get('terms')).toBe('no');

        button().click();
        fixture.detectChanges();

        expect(host.checked).toBe(true);
        expect(new FormData(form()).get('terms')).toBe('yes');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxCheckboxRootDirective, RdxCheckboxButtonDirective, RdxCheckboxIndicatorDirective],
    template: `
        <div [invalid]="invalid()" [errors]="errors()" rdxCheckboxRoot>
            <button rdxCheckboxButton>
                <span rdxCheckboxIndicator></span>
            </button>
        </div>
    `
})
class CheckboxValidationHost {
    readonly invalid = signal(false);
    readonly errors = signal<{ kind: string; message?: string }[]>([]);
}

describe('RdxCheckboxRoot validation state (batch #4)', () => {
    let fixture: ComponentFixture<CheckboxValidationHost>;
    let host: CheckboxValidationHost;
    let root: HTMLElement;
    let button: HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [CheckboxValidationHost] });
        fixture = TestBed.createComponent(CheckboxValidationHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxCheckboxRoot]')).nativeElement;
        button = fixture.debugElement.query(By.css('[rdxCheckboxButton]')).nativeElement;
    });

    it('is valid by default on root and button', () => {
        expect(root.getAttribute('data-valid')).toBe('');
        expect(root.getAttribute('data-invalid')).toBeNull();
        expect(button.getAttribute('aria-invalid')).toBeNull();
    });

    it('reflects the invalid input on root and button', () => {
        host.invalid.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(button.getAttribute('data-invalid')).toBe('');
        expect(button.getAttribute('aria-invalid')).toBe('true');
    });

    it('is invalid when the errors list is non-empty', () => {
        host.errors.set([{ kind: 'required', message: 'Required.' }]);
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(button.getAttribute('aria-invalid')).toBe('true');
    });

    it('marks dirty and touched after a toggle', () => {
        expect(root.getAttribute('data-dirty')).toBeNull();
        expect(root.getAttribute('data-touched')).toBeNull();
        button.click();
        fixture.detectChanges();
        expect(root.getAttribute('data-dirty')).toBe('');
        expect(root.getAttribute('data-touched')).toBe('');
        expect(button.getAttribute('data-touched')).toBe('');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxCheckboxRootDirective, RdxCheckboxButtonDirective, RdxCheckboxIndicatorDirective],
    template: `
        <div [formField]="terms" rdxCheckboxRoot>
            <button rdxCheckboxButton>
                <span rdxCheckboxIndicator></span>
            </button>
        </div>
    `
})
class CheckboxSignalFormHost {
    readonly model = signal({ terms: false });
    readonly formTree = form(this.model);

    get terms() {
        return this.formTree.terms;
    }
}

describe('RdxCheckboxRoot with Signal Forms', () => {
    let fixture: ComponentFixture<CheckboxSignalFormHost>;
    let host: CheckboxSignalFormHost;
    let button: HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [CheckboxSignalFormHost] });
        fixture = TestBed.createComponent(CheckboxSignalFormHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        button = fixture.debugElement.query(By.css('[rdxCheckboxButton]')).nativeElement;
    });

    it('updates the bound field on toggle (FormCheckboxControl)', () => {
        button.click();
        fixture.detectChanges();
        expect(host.model().terms).toBe(true);
        expect(button.getAttribute('aria-checked')).toBe('true');
    });

    it('reflects a programmatic field change', () => {
        host.model.update((value) => ({ ...value, terms: true }));
        fixture.detectChanges();
        expect(button.getAttribute('data-checked')).toBe('');
        expect(button.getAttribute('aria-checked')).toBe('true');
    });

    it('resets the value and control-owned interaction state through Signal Forms', () => {
        button.click();
        fixture.detectChanges();
        expect(host.terms().dirty()).toBe(true);
        expect(button.getAttribute('data-dirty')).toBe('');

        host.formTree().reset({ terms: false });
        fixture.detectChanges();

        expect(host.model().terms).toBe(false);
        expect(host.terms().dirty()).toBe(false);
        expect(host.terms().touched()).toBe(false);
        expect(button.getAttribute('aria-checked')).toBe('false');
        expect(button.getAttribute('data-dirty')).toBeNull();
        expect(button.getAttribute('data-touched')).toBeNull();
    });
});
