import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { CheckedState, getState, isIndeterminate, RdxCheckboxRootDirective } from '../src/checkbox-root';

@Component({
    imports: [RdxCheckboxRootDirective, RdxCheckboxButtonDirective, RdxCheckboxIndicatorDirective],
    template: `
        <div
            [checked]="checked"
            [disabled]="disabled"
            [readonly]="readonly"
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
    checked: CheckedState = false;
    disabled = false;
    readonly = false;
    required = false;

    changes: CheckedState[] = [];

    // Controlled: reflect the change back into the bound value.
    onChange(value: CheckedState): void {
        this.changes.push(value);
        this.checked = value;
    }
}

describe('RdxCheckbox', () => {
    let fixture: ComponentFixture<CheckboxHost>;
    let host: CheckboxHost;

    const button = () => fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    const indicator = () => fixture.debugElement.query(By.css('[rdxCheckboxIndicator]')).nativeElement as HTMLElement;

    function setup(initial: Partial<Pick<CheckboxHost, 'checked' | 'disabled' | 'readonly' | 'required'>> = {}) {
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

    describe('aria / data attributes', () => {
        it('starts unchecked', () => {
            setup();
            expect(button().getAttribute('role')).toBe('checkbox');
            expect(button().getAttribute('aria-checked')).toBe('false');
            expect(button().getAttribute('data-state')).toBe('unchecked');
            expect(indicator().hasAttribute('hidden')).toBe(true);
        });

        it('exposes Base UI parity attributes on the root', () => {
            setup({ checked: 'indeterminate', disabled: true, readonly: true });
            expect(root().getAttribute('data-state')).toBe('indeterminate');
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
            expect(root().getAttribute('data-state')).toBe('checked');
            expect(root().hasAttribute('data-disabled')).toBe(false);
            expect(root().hasAttribute('data-readonly')).toBe(false);
            expect(root().hasAttribute('data-required')).toBe(false);
        });

        it('reflects the checked state', () => {
            setup({ checked: true });
            expect(button().getAttribute('aria-checked')).toBe('true');
            expect(button().getAttribute('data-state')).toBe('checked');
            expect(indicator().hasAttribute('hidden')).toBe(false);
        });

        it('reflects the indeterminate state as aria-checked="mixed"', () => {
            setup({ checked: 'indeterminate' });
            expect(button().getAttribute('aria-checked')).toBe('mixed');
            expect(button().getAttribute('data-state')).toBe('indeterminate');
            expect(indicator().hasAttribute('hidden')).toBe(false);
        });

        it('exposes aria-required / aria-readonly / disabled', () => {
            setup({ readonly: true, disabled: true });
            expect(button().getAttribute('aria-readonly')).toBe('true');
            expect(button().getAttribute('data-readonly')).toBe('');
            expect(button().getAttribute('data-disabled')).toBe('');
            expect(button().hasAttribute('disabled')).toBe(true);
        });
    });

    describe('toggle()', () => {
        it('unchecked -> checked', () => {
            setup({ checked: false });
            button().click();
            fixture.detectChanges();
            expect(host.checked).toBe(true);
            expect(host.changes).toEqual([true]);
        });

        it('checked -> unchecked', () => {
            setup({ checked: true });
            button().click();
            fixture.detectChanges();
            expect(host.checked).toBe(false);
            expect(host.changes).toEqual([false]);
        });

        it('indeterminate -> checked (single emit)', () => {
            setup({ checked: 'indeterminate' });
            button().click();
            fixture.detectChanges();
            // The fix: indeterminate resolves to `true`, not `false`,
            // and onCheckedChange fires exactly once.
            expect(host.checked).toBe(true);
            expect(host.changes).toEqual([true]);
        });

        it('emits once per click across a full cycle', () => {
            setup({ checked: false });
            button().click();
            fixture.detectChanges();
            button().click();
            fixture.detectChanges();
            expect(host.changes).toEqual([true, false]);
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
});

@Component({
    imports: [RdxCheckboxRootDirective, RdxCheckboxButtonDirective, RdxCheckboxInputDirective],
    template: `
        <div [checked]="checked" (onCheckedChange)="checked = $event" rdxCheckboxRoot>
            <button rdxCheckboxButton><span>x</span></button>
            <input rdxCheckboxInput />
        </div>
    `
})
class CheckboxInputHost {
    checked: CheckedState = false;
}

describe('RdxCheckboxInput (hidden native input)', () => {
    let fixture: ComponentFixture<CheckboxInputHost>;
    let host: CheckboxInputHost;

    const input = () => fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    const button = () => fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    function setup(checked: CheckedState = false) {
        fixture = TestBed.createComponent(CheckboxInputHost);
        host = fixture.componentInstance;
        host.checked = checked;
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [CheckboxInputHost] });
    });

    it('reflects the checked state and stays in sync', () => {
        setup(false);
        expect(input().hasAttribute('checked')).toBe(false);
        expect(input().checked).toBe(false);
        expect(input().indeterminate).toBe(false);

        host.checked = true;
        fixture.detectChanges();
        expect(input().getAttribute('checked')).toBe('');
        expect(input().checked).toBe(true);
        expect(input().indeterminate).toBe(false);
    });

    it('does not submit indeterminate as checked, sets the native property', () => {
        setup('indeterminate');
        expect(input().hasAttribute('checked')).toBe(false);
        expect(input().checked).toBe(false);
        expect(input().indeterminate).toBe(true);
    });

    it('emits a bubbling change event on toggle but not on initial render', () => {
        setup(false);

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
