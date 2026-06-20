import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete],
    template: `
        <div
            #ac="rdxAutocompleteRoot"
            [(value)]="value"
            [(open)]="open"
            [items]="items()"
            [mode]="mode()"
            [autoHighlight]="autoHighlight()"
            virtualized
            rdxAutocompleteRoot
        >
            <input rdxAutocompleteInput aria-label="Item" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Items">
                        @for (item of ac.filteredItems(); track item; let i = $index) {
                            <div [value]="item" [index]="i" rdxAutocompleteItem>{{ item }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal('');
    readonly open = signal(false);
    readonly items = signal(['Alpha', 'Apple', 'Apricot', 'Banana', 'Cherry']);
    readonly mode = signal<'list' | 'both' | 'inline' | 'none'>('list');
    readonly autoHighlight = signal(false);
}

describe('Autocomplete virtualized', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function renderedItems(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxAutocompleteItem]'));
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

    it('filters the data source and renders only matches', async () => {
        host.open.set(true);
        await settle();
        type('ap');
        await settle();
        expect(renderedItems().map((el) => el.textContent?.trim())).toEqual(['Apple', 'Apricot']);
    });

    it('navigates by index and selects via aria-activedescendant', async () => {
        host.open.set(true);
        await settle();
        key('ArrowDown');
        await settle();
        const active = inputEl().getAttribute('aria-activedescendant');
        expect(active).toBe(renderedItems()[0].id);
    });

    it('selects the highlighted item by index on Enter', async () => {
        host.open.set(true);
        await settle();
        key('ArrowDown');
        await settle();
        key('ArrowDown');
        await settle();
        key('Enter');
        await settle();
        expect(host.value()).toBe('Apple');
        expect(host.open()).toBe(false);
    });

    // Characterization (ADR 0014, Phase 0): the virtualized self-heal must survive the engine extraction.
    it('clears a highlight that filtering pushes past the end of the list', async () => {
        host.open.set(true);
        await settle();
        // Highlight index 3 (Banana) in the full list.
        for (let i = 0; i < 4; i++) {
            key('ArrowDown');
            await settle();
        }
        expect(inputEl().getAttribute('aria-activedescendant')).toBe(renderedItems()[3].id);

        // Typing shrinks the filtered list to 2 items, so index 3 is out of range and self-heals to none.
        type('ap');
        await settle();
        expect(renderedItems().map((el) => el.textContent?.trim())).toEqual(['Apple', 'Apricot']);
        expect(inputEl().getAttribute('aria-activedescendant')).toBeNull();
    });

    // ADR 0014 review: inline completion must work in virtualized mode (the preview is derived from the
    // highlighted index, not a DOM item ref).
    it('inline-completes in virtualized mode (preview from the highlighted index)', async () => {
        host.mode.set('both');
        host.autoHighlight.set(true);
        await settle();
        type('ap');
        await settle();
        // First prefix match (Apple) is highlighted by index; the input shows the inline completion.
        expect(renderedItems().map((el) => el.textContent?.trim())).toEqual(['Apple', 'Apricot']);
        expect(inputEl().value).toBe('apple');
    });
});
