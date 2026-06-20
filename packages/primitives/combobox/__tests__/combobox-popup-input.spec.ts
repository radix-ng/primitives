import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div [(value)]="value" rdxComboboxRoot>
            <button rdxComboboxTrigger rdxComboboxAnchor>{{ value() ?? 'Select' }}</button>

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
class PopupInputHost {
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}

describe('Combobox with the input inside the popup', () => {
    let fixture: ComponentFixture<PopupInputHost>;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function trigger(): HTMLButtonElement {
        return fixture.nativeElement.querySelector('[rdxComboboxTrigger]');
    }
    function input(): HTMLInputElement | null {
        return document.querySelector('input[rdxComboboxInput]');
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxComboboxItem]'));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [PopupInputHost] });
        fixture = TestBed.createComponent(PopupInputHost);
        await settle();
    });

    it('focuses the search input when the popup opens', async () => {
        trigger().click();
        await settle();
        expect(input()).not.toBeNull();
        expect(document.activeElement).toBe(input());
    });

    it('returns focus to the trigger after a selection', async () => {
        trigger().click();
        await settle();
        items()[1].click();
        await settle();
        expect(fixture.componentInstance.value()).toBe('Banana');
        expect(document.activeElement).toBe(trigger());
    });

    it('clearing the in-popup search keeps the popup open and the selection (Base UI inputInsidePopup)', async () => {
        fixture.componentInstance.value.set('Banana');
        trigger().click(); // opens; the in-popup input mounts → layout 'inside'
        await settle();

        const search = input()!;
        search.value = 'App';
        search.dispatchEvent(new Event('input', { bubbles: true }));
        await settle();

        // Empty the search box.
        search.value = '';
        search.dispatchEvent(new Event('input', { bubbles: true }));
        await settle();

        // Selection retained (NOT deselected) and the popup stays open — only the search text cleared.
        expect(fixture.componentInstance.value()).toBe('Banana');
        expect(input()).not.toBeNull();
        expect(items().length).toBeGreaterThan(0);
    });

    it('can reopen from the trigger after selecting', async () => {
        trigger().click();
        await settle();
        items()[0].click();
        await settle();
        // focus is on the trigger; clicking (or Enter) reopens
        trigger().click();
        await settle();
        expect(input()).not.toBeNull();
        expect(document.activeElement).toBe(input());
    });
});
