import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

/**
 * Focus restoration after a selection (ADR 0014 review): the primitive restores focus to the input
 * (input outside the popup) or the trigger (input inside the popup) — UNLESS the consumer moved focus
 * inside the `onValueChange` callback, which must be respected (Base UI parity).
 */
@Component({
    imports: [_importsCombobox],
    template: `
        <button id="external" type="button">external</button>
        <div [(value)]="value" [(open)]="open" (onValueChange)="onChange()" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
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
    readonly open = signal(true);
    readonly fruits = ['apple', 'banana'];
    moveFocus = false;
    onChange(): void {
        if (this.moveFocus) {
            (document.getElementById('external') as HTMLElement).focus();
        }
    }
}

@Component({
    imports: [_importsCombobox],
    template: `
        <div [(value)]="value" [(open)]="open" rdxComboboxRoot>
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
    readonly open = signal(true);
    readonly fruits = ['apple', 'banana'];
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}
function firstItem(): HTMLElement {
    return document.querySelector('[rdxComboboxItem]') as HTMLElement;
}

describe('Combobox focus restoration after select', () => {
    it('input outside the popup → focus returns to the input', async () => {
        const fixture = TestBed.createComponent(OutsideHost);
        await settle(fixture);
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        input.focus();
        firstItem().click();
        await settle(fixture);
        expect(document.activeElement).toBe(input);
    });

    it('consumer moving focus in onValueChange is respected (focus not clobbered)', async () => {
        const fixture = TestBed.createComponent(OutsideHost);
        fixture.componentInstance.moveFocus = true;
        await settle(fixture);
        (fixture.nativeElement.querySelector('input') as HTMLInputElement).focus();
        firstItem().click();
        await settle(fixture);
        expect(document.activeElement).toBe(document.getElementById('external'));
    });

    it('input inside the popup → focus returns to the trigger', async () => {
        const fixture = TestBed.createComponent(InsideHost);
        await settle(fixture);
        // The popup auto-focuses its inner input on open; selecting restores focus to the trigger.
        firstItem().click();
        await settle(fixture);
        const trigger = fixture.nativeElement.querySelector('[rdxComboboxTrigger]');
        expect(document.activeElement).toBe(trigger);
    });
});

describe('Combobox popup role reflects the layout', () => {
    let fixture: ComponentFixture<unknown>;
    function popup(): HTMLElement {
        return document.querySelector('[rdxComboboxPopup]') as HTMLElement;
    }

    it('is role="presentation" with the input outside the popup', async () => {
        fixture = TestBed.createComponent(OutsideHost);
        await settle(fixture);
        expect(popup().getAttribute('role')).toBe('presentation');
        expect(popup().getAttribute('tabindex')).toBe('-1');
    });

    it('is role="dialog" with the input inside the popup', async () => {
        fixture = TestBed.createComponent(InsideHost);
        await settle(fixture);
        expect(popup().getAttribute('role')).toBe('dialog');
        expect(popup().getAttribute('tabindex')).toBe('-1');
    });
});
