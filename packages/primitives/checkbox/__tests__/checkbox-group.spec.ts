import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
