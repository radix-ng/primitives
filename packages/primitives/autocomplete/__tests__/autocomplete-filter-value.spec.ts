import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AcceptableValue } from '@radix-ng/primitives/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';
import { AutocompleteFilter } from '../src/autocomplete-root';

/**
 * Regression (ADR 0014 review): the value-first filter contract must hand the custom filter the real
 * `itemValue`. An absent `[value]` falls back to the item text, but an explicit falsy value (`''`,
 * `null`) is preserved — not replaced by the text.
 */
@Component({
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" [(open)]="open" [filter]="filter()" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Item" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Items">
                        <div rdxAutocompleteItem>Plain</div>
                        <div [value]="''" rdxAutocompleteItem>Empty</div>
                        <div [value]="null" rdxAutocompleteItem>Null</div>
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal('');
    readonly open = signal(false);
    readonly filter = signal<AutocompleteFilter | null | undefined>(undefined);
}

describe('Autocomplete filter value contract', () => {
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

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await settle();
    });

    it('passes the explicit (even falsy) value, and the text only when [value] is absent', async () => {
        const received: AcceptableValue[] = [];
        host.filter.set((itemValue) => {
            received.push(itemValue);
            return true;
        });
        host.open.set(true);
        await settle();
        // Type so the query is a fresh user query and the filter runs.
        inputEl().value = 'x';
        inputEl().dispatchEvent(new Event('input', { bubbles: true }));
        await settle();

        // Absent [value] → text 'Plain'; explicit '' and null are preserved verbatim.
        expect(received).toContain('Plain');
        expect(received).toContain('');
        expect(received).toContain(null);
    });
});
