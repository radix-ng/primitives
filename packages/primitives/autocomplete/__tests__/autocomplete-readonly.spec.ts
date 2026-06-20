import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';
import { AutocompleteValueChangeDetails } from '../src/autocomplete-root';

/**
 * Regression (ADR 0014 review, Finding 1): autocomplete's value IS the input string, so its single
 * `commitValue` must carry the same disabled / read-only guard combobox has. A read-only or disabled
 * autocomplete must not be mutable through the Clear button (the path that regressed) — the button is
 * also rendered disabled so it doesn't merely look actionable.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete],
    template: `
        <div
            [(value)]="value"
            [readOnly]="readOnly()"
            [disabled]="disabled()"
            (onValueChange)="changes.push($event)"
            rdxAutocompleteRoot
        >
            <input rdxAutocompleteInput aria-label="Fruit" />
            <button rdxAutocompleteClear>clear</button>
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
    readonly readOnly = signal(true);
    readonly disabled = signal(false);
    readonly fruits = ['Apple', 'Apricot', 'Banana'];
    readonly changes: AutocompleteValueChangeDetails[] = [];
}

describe('Autocomplete read-only value guard', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function clearButton(): HTMLButtonElement {
        return fixture.nativeElement.querySelector('[rdxAutocompleteClear]');
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

    it('does not clear the value via the Clear button when read-only', async () => {
        clearButton().click();
        await settle();
        expect(host.value()).toBe('Apple');
        expect(host.changes).toEqual([]);
    });

    it('renders the Clear button disabled when read-only', () => {
        expect(clearButton().hasAttribute('disabled')).toBe(true);
    });

    it('also blocks the Clear mutation when disabled', async () => {
        host.readOnly.set(false);
        host.disabled.set(true);
        await settle();
        clearButton().click();
        await settle();
        expect(host.value()).toBe('Apple');
        expect(host.changes).toEqual([]);
        expect(clearButton().hasAttribute('disabled')).toBe(true);
    });

    it('clears normally once read-only is lifted', async () => {
        host.readOnly.set(false);
        await settle();
        expect(clearButton().hasAttribute('disabled')).toBe(false);
        clearButton().click();
        await settle();
        expect(host.value()).toBe('');
        expect(host.changes.at(-1)).toEqual({ value: '', reason: 'input-clear' });
    });
});
