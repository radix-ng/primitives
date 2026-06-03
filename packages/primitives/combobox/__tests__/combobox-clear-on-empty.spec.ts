import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * Regression (ADR 0014, Finding 2 / P1c): emptying the input deselects a single value, and when
 * `openOnInputClick` is false the empty field also closes the popup. Multiple mode keeps its chips.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div
            rdxComboboxRoot
            [multiple]="multiple()"
            [openOnInputClick]="openOnInputClick()"
            [(value)]="value"
            [(open)]="open"
        >
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div rdxComboboxItem [value]="fruit">{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal<unknown>(null);
    readonly open = signal(false);
    readonly multiple = signal(false);
    readonly openOnInputClick = signal(true);
    readonly fruits = ['apple', 'banana', 'grape'];
}

describe('Combobox clear-on-empty (P1c)', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function clearText(): void {
        const el = inputEl();
        el.value = '';
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await settle();
    });

    it('clears a single selection when the field is emptied (popup stays open by default)', async () => {
        host.value.set('apple');
        host.open.set(true); // browse mode: open, then empty the field
        await settle();
        clearText();
        await settle();
        expect(host.value()).toBeNull();
        // openOnInputClick=true → emptying does not close the popup (and an empty value never opens one).
        expect(host.open()).toBe(true);
    });

    it('also closes the popup when openOnInputClick is false', async () => {
        host.openOnInputClick.set(false);
        host.value.set('apple');
        host.open.set(true);
        await settle();
        clearText();
        await settle();
        expect(host.value()).toBeNull();
        expect(host.open()).toBe(false);
    });

    it('does not open the popup when only whitespace is typed (Base UI trims)', async () => {
        host.openOnInputClick.set(false); // isolate the typing-opens-popup path
        await settle();
        expect(host.open()).toBe(false);
        const el = inputEl();
        el.value = '   ';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        await settle();
        expect(host.open()).toBe(false);
    });

    it('does not clear chips in multiple mode when the field is emptied', async () => {
        host.multiple.set(true);
        host.value.set(['apple', 'banana']);
        await settle();
        clearText();
        await settle();
        expect(host.value()).toEqual(['apple', 'banana']);
    });
});
