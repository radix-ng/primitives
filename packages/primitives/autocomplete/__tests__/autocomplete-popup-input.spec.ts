import { _importsAutocomplete } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete],
    template: `
        <div rdxAutocompleteRoot [(value)]="value">
            <button rdxAutocompleteTrigger rdxAutocompleteAnchor>Choose</button>

            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <input rdxAutocompleteInput aria-label="Search" />
                    <div rdxAutocompleteList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div rdxAutocompleteItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class PopupInputHost {
    readonly value = signal('');
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}

describe('Autocomplete with the input inside the popup', () => {
    let fixture: ComponentFixture<PopupInputHost>;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function trigger(): HTMLButtonElement {
        return fixture.nativeElement.querySelector('[rdxAutocompleteTrigger]');
    }
    function input(): HTMLInputElement | null {
        return document.querySelector('input[rdxAutocompleteInput]');
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxAutocompleteItem]'));
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
});
