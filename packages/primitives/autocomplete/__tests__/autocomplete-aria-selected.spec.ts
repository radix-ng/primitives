import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';

/**
 * Regression (ADR 0014 review, Finding 3): autocomplete is always `selectionMode="none"`, so options
 * never carry selection state. Base UI omits `aria-selected` / `data-selected` for autocomplete options
 * — even the one whose value equals the current input string must not be reported as selected.
 */
@Component({
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" [(open)]="open" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Fruit" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxAutocompleteItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal('Apple');
    readonly open = signal(true);
    readonly fruits = ['Apple', 'Apricot', 'Banana'];
}

describe('Autocomplete options omit selection attributes', () => {
    let fixture: ComponentFixture<HostComponent>;

    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxAutocompleteItem]')) as HTMLElement[];
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        await settle();
    });

    it('never sets aria-selected or data-selected, even on the option matching the input value', () => {
        const rendered = items();
        expect(rendered.length).toBeGreaterThan(0);
        for (const item of rendered) {
            expect(item.hasAttribute('aria-selected')).toBe(false);
            expect(item.hasAttribute('data-selected')).toBe(false);
        }
    });
});
