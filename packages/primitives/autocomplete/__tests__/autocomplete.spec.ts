import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';
import { AutocompleteFilter, AutocompleteValueChangeDetails, RdxAutocompleteRoot } from '../src/autocomplete-root';

@Component({
    imports: [_importsAutocomplete],
    template: `
        <div
            [(value)]="value"
            [(open)]="open"
            [filter]="filter()"
            [autoHighlight]="autoHighlight()"
            [openOnInputClick]="openOnInputClick()"
            (onValueChange)="changes.push($event)"
            rdxAutocompleteRoot
        >
            <label rdxAutocompleteLabel>Fruit</label>
            <input rdxAutocompleteInput />
            <button rdxAutocompleteTrigger>open</button>
            <button rdxAutocompleteClear>clear</button>

            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Fruits">
                        @for (fruit of fruits(); track fruit) {
                            <div rdxAutocompleteItem>{{ fruit }}</div>
                        }
                    </div>
                    <div rdxAutocompleteEmpty>No results</div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal('');
    readonly open = signal(false);
    readonly autoHighlight = signal(false);
    readonly openOnInputClick = signal(false);
    readonly filter = signal<AutocompleteFilter | null | undefined>(undefined);
    readonly fruits = signal(['Apple', 'Banana', 'Grape']);
    readonly changes: AutocompleteValueChangeDetails[] = [];
}

describe('Autocomplete', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function root(): RdxAutocompleteRoot {
        return fixture.debugElement.query(By.directive(RdxAutocompleteRoot)).injector.get(RdxAutocompleteRoot);
    }
    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxAutocompleteItem]'));
    }
    function visibleItems(): HTMLElement[] {
        return items().filter((el) => !el.hasAttribute('hidden'));
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function type(text: string): void {
        const el = inputEl();
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function key(k: string): void {
        inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await settle();
    });

    describe('open / close', () => {
        it('opens on typing', async () => {
            type('a');
            await settle();
            expect(host.open()).toBe(true);
        });

        it('does not open on input click by default', async () => {
            inputEl().dispatchEvent(new Event('click', { bubbles: true }));
            await settle();
            expect(host.open()).toBe(false);
        });

        it('opens on input click when openOnInputClick is set', async () => {
            host.openOnInputClick.set(true);
            await settle();
            inputEl().dispatchEvent(new Event('click', { bubbles: true }));
            await settle();
            expect(host.open()).toBe(true);
        });

        it('toggles via the trigger', async () => {
            fixture.nativeElement.querySelector('[rdxAutocompleteTrigger]').click();
            await settle();
            expect(host.open()).toBe(true);
            fixture.nativeElement.querySelector('[rdxAutocompleteTrigger]').click();
            await settle();
            expect(host.open()).toBe(false);
        });

        it('closes on Escape', async () => {
            host.open.set(true);
            await settle();
            key('Escape');
            await settle();
            expect(host.open()).toBe(false);
        });
    });

    describe('value = input string', () => {
        it('sets the value to the typed text', async () => {
            type('ap');
            await settle();
            expect(host.value()).toBe('ap');
        });

        it('selecting an item writes its text into the value and closes', async () => {
            host.open.set(true);
            await settle();
            visibleItems()[1].click();
            await settle();
            expect(host.value()).toBe('Banana');
            expect(host.open()).toBe(false);
        });

        it('clear empties the value', async () => {
            host.value.set('Apple');
            await settle();
            fixture.nativeElement.querySelector('[rdxAutocompleteClear]').click();
            await settle();
            expect(host.value()).toBe('');
        });

        it('reports the change reason for typing, selection, and clear', async () => {
            type('ap');
            await settle();
            expect(host.changes.at(-1)).toEqual({ value: 'ap', reason: 'input-change' });

            visibleItems()[0].click();
            await settle();
            expect(host.changes.at(-1)).toEqual({ value: 'Apple', reason: 'item-press' });

            fixture.nativeElement.querySelector('[rdxAutocompleteClear]').click();
            await settle();
            expect(host.changes.at(-1)).toEqual({ value: '', reason: 'input-clear' });
        });
    });

    describe('filtering', () => {
        it('filters by default substring (case-insensitive)', async () => {
            host.open.set(true);
            await settle();
            type('ap');
            await settle();
            const labels = visibleItems().map((el) => el.textContent?.trim());
            expect(labels).toEqual(['Apple', 'Grape']);
        });

        it('shows the empty state when nothing matches', async () => {
            host.open.set(true);
            await settle();
            type('zzz');
            await settle();
            expect(visibleItems()).toHaveLength(0);
            expect(document.querySelector('[rdxAutocompleteEmpty]')!.hasAttribute('hidden')).toBe(false);
        });

        it('uses a custom filter when provided', async () => {
            host.filter.set((text, query) => text.toLowerCase().startsWith(query.toLowerCase()));
            host.open.set(true);
            await settle();
            type('ap');
            await settle();
            expect(visibleItems().map((el) => el.textContent?.trim())).toEqual(['Apple']);
        });
    });

    describe('keyboard navigation', () => {
        it('opens and highlights the first item on ArrowDown', async () => {
            key('ArrowDown');
            await settle();
            expect(host.open()).toBe(true);
            expect(visibleItems()[0].hasAttribute('data-highlighted')).toBe(true);
        });

        it('selects the highlighted item on Enter', async () => {
            key('ArrowDown');
            await settle();
            key('ArrowDown');
            await settle();
            key('Enter');
            await settle();
            expect(host.value()).toBe('Banana');
            expect(host.open()).toBe(false);
        });

        it('exposes aria-activedescendant for the highlighted item', async () => {
            key('ArrowDown');
            await settle();
            const active = inputEl().getAttribute('aria-activedescendant');
            expect(active).toBe(visibleItems()[0].id);
        });
    });

    describe('accessibility', () => {
        it('sets combobox role and aria wiring on the input', () => {
            const input = inputEl();
            expect(input.getAttribute('role')).toBe('combobox');
            expect(input.getAttribute('aria-controls')).toBe(root().listId);
            expect(input.getAttribute('aria-expanded')).toBe('false');
        });

        it('has no axe violations when open', async () => {
            host.open.set(true);
            await settle();
            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });
});

describe('Autocomplete structural portal', () => {
    it('throws in dev mode when rdxAutocompletePortal is used as an attribute instead of structurally', () => {
        @Component({
            imports: [_importsAutocomplete],
            template: `
                <div rdxAutocompleteRoot>
                    <input rdxAutocompleteInput aria-label="Search" />
                    <div rdxAutocompletePortal>
                        <div rdxAutocompletePopup>Oops</div>
                    </div>
                </div>
            `
        })
        class MisuseHost {}

        expect(() => {
            const fixture = TestBed.createComponent(MisuseHost);
            fixture.detectChanges();
        }).toThrow(/structural directive/);
    });
});
