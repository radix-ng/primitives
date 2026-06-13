import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

/**
 * Trigger parity (ADR 0014 review): the trigger's role depends on the layout (Base UI's
 * `inputInsidePopup`). With the input outside the popup it is a `tabindex="-1"` toggle
 * (`aria-haspopup="listbox"`); with the input inside the popup it becomes the focusable
 * `role="combobox"` control (`tabindex="0"`, `aria-haspopup="dialog"`). The state is detected from the
 * input (positioner ancestor) — never hard-coded in a story.
 */
@Component({
    imports: [_importsCombobox],
    template: `
        <div [(value)]="value" [(open)]="open" [required]="required()" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <button rdxComboboxTrigger>open</button>
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxComboboxItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class OutsideHost {
    readonly value = signal<string | null>(null);
    readonly open = signal(false);
    readonly required = signal(false);
    readonly fruits = ['Apple', 'Banana'];
}

@Component({
    imports: [_importsCombobox],
    template: `
        <div [(value)]="value" [(open)]="open" [required]="required()" rdxComboboxRoot>
            <button rdxComboboxTrigger rdxComboboxAnchor>open</button>
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <input rdxComboboxInput aria-label="Search" />
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxComboboxItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class InsideHost {
    readonly value = signal<string | null>(null);
    readonly open = signal(false);
    readonly required = signal(false);
    readonly fruits = ['Apple', 'Banana'];
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}
function trigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
    return fixture.nativeElement.querySelector('[rdxComboboxTrigger]');
}

describe('Combobox trigger — input outside the popup (default layout)', () => {
    let fixture: ComponentFixture<OutsideHost>;

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [OutsideHost] });
        fixture = TestBed.createComponent(OutsideHost);
        fixture.componentInstance.open.set(true);
        await settle(fixture);
    });

    it('is a tabindex="-1" toggle with aria-haspopup="listbox" and no combobox role', () => {
        const t = trigger(fixture);
        expect(t.getAttribute('tabindex')).toBe('-1');
        expect(t.hasAttribute('role')).toBe(false);
        expect(t.getAttribute('aria-haspopup')).toBe('listbox');
        expect(t.hasAttribute('aria-required')).toBe(false);
    });
});

describe('Combobox trigger — input inside the popup', () => {
    let fixture: ComponentFixture<InsideHost>;

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [InsideHost] });
        fixture = TestBed.createComponent(InsideHost);
        await settle(fixture);
    });

    it('is Tab-reachable (tabindex="0") from the first render, before the popup has ever opened', () => {
        // The input lives in the not-yet-mounted popup, so the layout is still `unknown`; the trigger
        // must NOT be demoted to tabindex="-1", otherwise Tab skips it and the picker is unreachable.
        expect(fixture.componentInstance.open()).toBe(false);
        expect(trigger(fixture).getAttribute('tabindex')).toBe('0');
    });

    it('becomes role="combobox" with tabindex="0" / aria-haspopup="dialog" once the popup mounts', async () => {
        // Open so the in-popup input mounts and reports `inputInsidePopup`.
        fixture.componentInstance.open.set(true);
        await settle(fixture);

        const t = trigger(fixture);
        expect(t.getAttribute('role')).toBe('combobox');
        expect(t.getAttribute('tabindex')).toBe('0');
        expect(t.getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('reflects aria-required only in the inside-popup layout', async () => {
        fixture.componentInstance.required.set(true);
        fixture.componentInstance.open.set(true);
        await settle(fixture);
        expect(trigger(fixture).getAttribute('aria-required')).toBe('true');
    });

    it('opens the popup on ArrowDown from the trigger', async () => {
        expect(fixture.componentInstance.open()).toBe(false);
        trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await settle(fixture);
        expect(fixture.componentInstance.open()).toBe(true);
    });
});
