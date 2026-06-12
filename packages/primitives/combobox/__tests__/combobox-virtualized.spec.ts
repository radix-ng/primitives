import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';
import { ComboboxItemHighlightedDetails, RdxComboboxRoot } from '../src/combobox-root';

// Only a 5-item window is ever rendered, so any assertion about navigation past index 4 proves the
// root drives highlight/selection from `items` data by index rather than from mounted DOM elements.
@Component({
    imports: [_importsCombobox],
    template: `
        <div
            #cmb="rdxComboboxRoot"
            [(value)]="value"
            [(open)]="open"
            [items]="items"
            (onItemHighlighted)="events.push($event)"
            virtualized
            rdxComboboxRoot
        >
            <input rdxComboboxInput aria-label="Item" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Items">
                        @for (i of windowIndexes; track i) {
                            <div [value]="cmb.filteredItems()[i]" [index]="i" rdxComboboxItem>
                                {{ cmb.filteredItems()[i] }}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class VirtualHost {
    readonly value = signal<string | null>(null);
    readonly open = signal(false);
    readonly items = Array.from({ length: 100 }, (_, index) => `Item ${index}`);
    readonly windowIndexes = [0, 1, 2, 3, 4];
    readonly events: ComboboxItemHighlightedDetails[] = [];
}

describe('Combobox virtualized mode', () => {
    let fixture: ComponentFixture<VirtualHost>;
    let host: VirtualHost;
    let root: RdxComboboxRoot;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function key(k: string): void {
        inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [VirtualHost] });
        fixture = TestBed.createComponent(VirtualHost);
        host = fixture.componentInstance;
        root = fixture.debugElement.query(By.directive(RdxComboboxRoot)).injector.get(RdxComboboxRoot);
        await settle();
    });

    it('filteredItems narrows to the query against the full items array', async () => {
        host.open.set(true);
        await settle();
        expect(root.filteredItems().length).toBe(100);

        root.setInputValue('99');
        await settle();
        expect(root.filteredItems()).toEqual(['Item 99']);
    });

    it('arrow navigation moves the highlight past the rendered window', async () => {
        host.open.set(true);
        await settle();

        // -1 → 0 → 1 → ... → 6: index 6 is well beyond the 5-item rendered window.
        for (let i = 0; i < 7; i++) {
            key('ArrowDown');
            await settle();
        }

        expect(root.highlightedIndex()).toBe(6);
        expect(root.activeId()).toBe(`${root.listId}-item-6`);
        expect(inputEl().getAttribute('aria-activedescendant')).toBe(`${root.listId}-item-6`);
    });

    it('onItemHighlighted emits value, index, and keyboard reason', async () => {
        host.open.set(true);
        await settle();
        host.events.length = 0;

        key('ArrowDown');
        await settle();

        expect(host.events.at(-1)).toEqual({ value: 'Item 0', index: 0, reason: 'keyboard' });
    });

    it('selecting an index outside the window commits the value and label', async () => {
        host.open.set(true);
        await settle();

        root.selectIndex(50);
        await settle();

        expect(host.value()).toBe('Item 50');
        expect(root.inputValue()).toBe('Item 50');
    });
});
