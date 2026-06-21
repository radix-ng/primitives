import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { RdxCheckboxModule } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxCheckboxModule],
    template: `
        <div
            [(value)]="value"
            [allValues]="all"
            [disabled]="disabled"
            (onValueChange)="onValueChange($event)"
            rdxCheckboxGroup
        >
            <div parent rdxCheckboxRoot>
                <button rdxCheckboxButton><span rdxCheckboxIndicator></span></button>
            </div>
            <div name="fizz" rdxCheckboxRoot>
                <button rdxCheckboxButton><span rdxCheckboxIndicator></span></button>
            </div>
            <div name="buzz" rdxCheckboxRoot>
                <button rdxCheckboxButton><span rdxCheckboxIndicator></span></button>
            </div>
        </div>
    `
})
class GroupHost {
    value: string[] = [];
    all = ['fizz', 'buzz'];
    disabled = false;
    changes: string[][] = [];
    cancelNext = false;

    onValueChange(change: { value: string[]; eventDetails: { cancel(): void } }): void {
        this.changes.push(change.value);
        if (this.cancelNext) {
            change.eventDetails.cancel();
            this.cancelNext = false;
        }
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxCheckboxModule],
    template: `
        <div [(value)]="value" [allValues]="all" rdxCheckboxGroup>
            <div parent rdxCheckboxRoot>
                <button rdxCheckboxButton><span rdxCheckboxIndicator></span></button>
            </div>
            <div name="a" rdxCheckboxRoot>
                <button rdxCheckboxButton><span rdxCheckboxIndicator></span></button>
            </div>
            <div [disabled]="true" name="b" rdxCheckboxRoot>
                <button rdxCheckboxButton><span rdxCheckboxIndicator></span></button>
            </div>
        </div>
    `
})
class DisabledChildHost {
    // The disabled child `b` starts checked and must stay checked through select-all/none.
    value: string[] = ['b'];
    all = ['a', 'b'];
}

describe('RdxCheckboxGroup', () => {
    let fixture: ComponentFixture<GroupHost>;
    let host: GroupHost;

    const buttons = () =>
        fixture.debugElement.queryAll(By.css('button')).map((d) => d.nativeElement as HTMLButtonElement);
    const state = (i: number) => {
        const button = buttons()[i];
        if (button.hasAttribute('data-indeterminate')) {
            return 'indeterminate';
        }
        if (button.hasAttribute('data-checked')) {
            return 'checked';
        }
        if (button.hasAttribute('data-unchecked')) {
            return 'unchecked';
        }
        return null;
    };

    function setup(initial: Partial<Pick<GroupHost, 'value' | 'all' | 'disabled'>> = {}) {
        TestBed.configureTestingModule({ imports: [GroupHost] });
        fixture = TestBed.createComponent(GroupHost);
        host = fixture.componentInstance;
        Object.assign(host, initial);
        fixture.detectChanges();
    }

    it('has role="group"', () => {
        setup();
        const group: HTMLElement = fixture.nativeElement.querySelector('[rdxCheckboxGroup]');
        expect(group.getAttribute('role')).toBe('group');
    });

    it('parent exposes aria-controls listing the child control ids', () => {
        setup();
        const [parent, fizz, buzz] = buttons();

        expect(fizz.id).toBeTruthy();
        expect(buzz.id).toBeTruthy();
        // listed in allValues order
        expect(parent.getAttribute('aria-controls')).toBe(`${fizz.id} ${buzz.id}`);
        // children themselves carry no aria-controls
        expect(fizz.hasAttribute('aria-controls')).toBe(false);
    });

    it('reflects the group value on each child', () => {
        setup({ value: ['fizz'] });
        // buttons: [parent, fizz, buzz]
        expect(state(1)).toBe('checked');
        expect(state(2)).toBe('unchecked');
    });

    it('toggling a child adds/removes its name and emits onValueChange', () => {
        setup();
        buttons()[1].click();
        fixture.detectChanges();
        expect(host.value).toEqual(['fizz']);

        buttons()[2].click();
        fixture.detectChanges();
        expect(host.value).toEqual(['fizz', 'buzz']);

        buttons()[1].click();
        fixture.detectChanges();
        expect(host.value).toEqual(['buzz']);

        expect(host.changes).toEqual([['fizz'], ['fizz', 'buzz'], ['buzz']]);
    });

    it('derives the parent state: none → unchecked, some → indeterminate, all → checked', () => {
        setup();
        expect(state(0)).toBe('unchecked');

        buttons()[1].click();
        fixture.detectChanges();
        expect(state(0)).toBe('indeterminate');

        buttons()[2].click();
        fixture.detectChanges();
        expect(state(0)).toBe('checked');
    });

    it('parent checks all when not all checked, unchecks all when all checked', () => {
        setup({ value: ['fizz'] });

        // partial → check all
        buttons()[0].click();
        fixture.detectChanges();
        expect(host.value).toEqual(['fizz', 'buzz']);

        // all → uncheck all
        buttons()[0].click();
        fixture.detectChanges();
        expect(host.value).toEqual([]);
    });

    it('a disabled group ignores toggles and marks children disabled', () => {
        setup({ disabled: true });

        buttons()[1].click();
        fixture.detectChanges();

        expect(host.value).toEqual([]);
        expect(buttons()[1].hasAttribute('disabled')).toBe(false);
        expect(buttons()[1].getAttribute('aria-disabled')).toBe('true');
        expect(state(1)).toBe('unchecked');
    });

    it('allows canceling child changes before state updates', () => {
        setup();
        host.cancelNext = true;

        buttons()[1].click();
        fixture.detectChanges();

        expect(host.value).toEqual([]);
        expect(host.changes).toEqual([['fizz']]);
    });

    it('parent remembers a partial selection across the cycle (partial → all → none → partial)', () => {
        setup({ value: ['fizz'] });
        const parent = () => buttons()[0];

        parent().click();
        fixture.detectChanges();
        expect(host.value).toEqual(['fizz', 'buzz']); // all

        parent().click();
        fixture.detectChanges();
        expect(host.value).toEqual([]); // none

        parent().click();
        fixture.detectChanges();
        expect(host.value).toEqual(['fizz']); // remembered partial restored

        parent().click();
        fixture.detectChanges();
        expect(host.value).toEqual(['fizz', 'buzz']); // cycle continues from the partial
    });

    it('a direct child change resets the remembered selection to a plain all/none toggle', () => {
        setup({ value: ['fizz'] });

        // Check the second child directly → remembered becomes the full set.
        buttons()[2].click();
        fixture.detectChanges();
        expect(host.value).toEqual(['fizz', 'buzz']);

        // Now the parent is a simple toggle: all → none → all (no partial to restore).
        buttons()[0].click();
        fixture.detectChanges();
        expect(host.value).toEqual([]);

        buttons()[0].click();
        fixture.detectChanges();
        expect(host.value).toEqual(['fizz', 'buzz']);
    });

    it('select-all preserves a disabled-but-checked child', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ imports: [DisabledChildHost] });
        const f = TestBed.createComponent(DisabledChildHost);
        f.detectChanges();
        const parent = f.debugElement.queryAll(By.css('button'))[0].nativeElement as HTMLButtonElement;

        // partial (only disabled `b` checked) → check all enabled, keep `b`
        parent.click();
        f.detectChanges();
        expect(f.componentInstance.value).toEqual(['a', 'b']);

        // → uncheck all enabled, but `b` is disabled and stays checked
        parent.click();
        f.detectChanges();
        expect(f.componentInstance.value).toEqual(['b']);
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxCheckboxModule],
    template: `
        <div [invalid]="invalid()" [errors]="errors()" [dirty]="dirty()" [allValues]="all" rdxCheckboxGroup>
            <div name="a" rdxCheckboxRoot>
                <button rdxCheckboxButton><span rdxCheckboxIndicator></span></button>
            </div>
            <div name="b" rdxCheckboxRoot>
                <button rdxCheckboxButton><span rdxCheckboxIndicator></span></button>
            </div>
        </div>
    `
})
class GroupValidationHost {
    readonly invalid = signal(false);
    readonly dirty = signal(false);
    readonly errors = signal<{ kind: string; message?: string }[]>([]);
    readonly all = ['a', 'b'];
}

describe('RdxCheckboxGroup validation state', () => {
    let fixture: ComponentFixture<GroupValidationHost>;
    let host: GroupValidationHost;
    let group: HTMLElement;
    let buttons: HTMLButtonElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [GroupValidationHost] });
        fixture = TestBed.createComponent(GroupValidationHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        group = fixture.debugElement.query(By.css('[rdxCheckboxGroup]')).nativeElement;
        buttons = fixture.debugElement.queryAll(By.css('button[rdxCheckboxButton]')).map((d) => d.nativeElement);
    });

    it('is valid by default', () => {
        expect(group.getAttribute('data-valid')).toBe('');
        expect(group.getAttribute('data-invalid')).toBeNull();
        expect(group.getAttribute('aria-invalid')).toBeNull();
    });

    it('reflects the invalid input on the group', () => {
        host.invalid.set(true);
        fixture.detectChanges();
        expect(group.getAttribute('data-invalid')).toBe('');
        expect(group.getAttribute('aria-invalid')).toBe('true');
    });

    it('is invalid when the errors list is non-empty', () => {
        host.errors.set([{ kind: 'required', message: 'Pick one.' }]);
        fixture.detectChanges();
        expect(group.getAttribute('data-invalid')).toBe('');
        expect(group.getAttribute('aria-invalid')).toBe('true');
    });

    it('marks dirty after a value change', () => {
        expect(group.getAttribute('data-dirty')).toBeNull();
        buttons[0].click();
        fixture.detectChanges();
        expect(group.getAttribute('data-dirty')).toBe('');
    });

    it('marks touched on focus-out', () => {
        expect(group.getAttribute('data-touched')).toBeNull();
        group.dispatchEvent(new FocusEvent('focusout'));
        fixture.detectChanges();
        expect(group.getAttribute('data-touched')).toBe('');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxCheckboxModule, FormField],
    template: `
        <div [formField]="picks" [allValues]="all" rdxCheckboxGroup>
            <div name="a" rdxCheckboxRoot>
                <button rdxCheckboxButton><span rdxCheckboxIndicator></span></button>
            </div>
            <div name="b" rdxCheckboxRoot>
                <button rdxCheckboxButton><span rdxCheckboxIndicator></span></button>
            </div>
        </div>
    `
})
class GroupSignalFormHost {
    readonly model = signal<{ picks: string[] }>({ picks: ['b'] });
    readonly formTree = form(this.model);
    readonly all = ['a', 'b'];

    get picks() {
        return this.formTree.picks;
    }
}

describe('RdxCheckboxGroup with Signal Forms', () => {
    let fixture: ComponentFixture<GroupSignalFormHost>;
    let host: GroupSignalFormHost;
    let buttons: HTMLButtonElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [GroupSignalFormHost] });
        fixture = TestBed.createComponent(GroupSignalFormHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        buttons = fixture.debugElement.queryAll(By.css('button[rdxCheckboxButton]')).map((d) => d.nativeElement);
    });

    it('reflects the bound field value (FormValueControl)', () => {
        expect(buttons[1].getAttribute('aria-checked')).toBe('true');
        expect(buttons[0].getAttribute('aria-checked')).toBe('false');
        host.model.update((value) => ({ ...value, picks: ['a', 'b'] }));
        fixture.detectChanges();
        expect(buttons[0].getAttribute('aria-checked')).toBe('true');
    });

    it('updates the bound field on toggle', () => {
        buttons[0].click();
        fixture.detectChanges();
        expect(host.model().picks).toEqual(['b', 'a']);
    });
});
