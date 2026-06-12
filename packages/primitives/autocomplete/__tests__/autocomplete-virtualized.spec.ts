import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';

@Component({
    imports: [_importsAutocomplete],
    template: `
        <div
            #ac="rdxAutocompleteRoot"
            [(value)]="value"
            [(open)]="open"
            [items]="items()"
            virtualized
            rdxAutocompleteRoot
        >
            <input rdxAutocompleteInput aria-label="Item" />
            <div rdxAutocompletePortal>
                <ng-template rdxAutocompletePortalPresence>
                    <div rdxAutocompletePositioner>
                        <div rdxAutocompletePopup>
                            <div rdxAutocompleteList aria-label="Items">
                                @for (item of ac.filteredItems(); track item; let i = $index) {
                                    <div [value]="item" [index]="i" rdxAutocompleteItem>{{ item }}</div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal('');
    readonly open = signal(false);
    readonly items = signal(['Alpha', 'Apple', 'Apricot', 'Banana', 'Cherry']);
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
});
