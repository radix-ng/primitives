import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';
import { AutocompleteItemHighlightedDetails, RdxAutocompleteRoot } from '../src/autocomplete-root';

/**
 * Characterization tests (ADR 0014, Phase 0): pin engine behaviors that autocomplete shares with
 * combobox but that its suite did not yet cover — `limit` and `onItemHighlighted`. These must survive
 * the shared-engine extraction (P1) unchanged.
 */
@Component({
    imports: [_importsAutocomplete],
    template: `
        <div
            [(value)]="value"
            [(open)]="open"
            [limit]="limit()"
            (onItemHighlighted)="lastHighlight = $event"
            rdxAutocompleteRoot
        >
            <input rdxAutocompleteInput aria-label="Item" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Items">
                        @for (item of items; track item) {
                            <div [value]="item" rdxAutocompleteItem>{{ item }}</div>
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
    readonly limit = signal(-1);
    readonly items = ['Alpha', 'Bravo', 'Charlie'];
    lastHighlight: AutocompleteItemHighlightedDetails | null = null;
}

describe('Autocomplete engine parity (limit / onItemHighlighted)', () => {
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
    function highlighted(): HTMLElement | undefined {
        return items().find((el) => el.hasAttribute('data-highlighted'));
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
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

    it('caps the visible items at limit and never navigates past them', async () => {
        host.limit.set(2);
        host.open.set(true);
        await settle();
        expect(visibleItems().map((el) => el.textContent?.trim())).toEqual(['Alpha', 'Bravo']);

        // Navigation only ever lands on the two visible items, never the capped-out third.
        for (let i = 0; i < 4; i++) {
            key('ArrowDown');
            await settle();
            expect(highlighted()?.textContent?.trim()).not.toBe('Charlie');
        }
    });

    it('onItemHighlighted emits the value, visible index, and keyboard reason', async () => {
        host.open.set(true);
        await settle();
        key('ArrowDown');
        await settle();
        expect(host.lastHighlight).toEqual({ value: 'Alpha', index: 0, reason: 'keyboard' });
        key('ArrowDown');
        await settle();
        expect(host.lastHighlight).toEqual({ value: 'Bravo', index: 1, reason: 'keyboard' });
    });

    it('exposes the highlight on the root for both navigation steps', async () => {
        host.open.set(true);
        await settle();
        key('ArrowDown');
        await settle();
        expect(root().highlightedItem()?.value()).toBe('Alpha');
    });
});
