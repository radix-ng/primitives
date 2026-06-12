import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';

@Component({
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" [(open)]="open" grid rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Color" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Colors">
                        @for (row of rows(); track $index) {
                            <div rdxAutocompleteRow>
                                @for (cell of row; track cell) {
                                    <div rdxAutocompleteItem>{{ cell }}</div>
                                }
                            </div>
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
    readonly rows = signal([
        ['Red', 'Green', 'Blue'],
        ['Cyan', 'Magenta', 'Yellow'],
        ['Black', 'White', 'Gray']
    ]);
}

describe('Autocomplete grid', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxAutocompleteItem]'));
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

    it('sets role=grid on the list and role=row on rows', async () => {
        host.open.set(true);
        await settle();
        expect(document.querySelector('[rdxAutocompleteList]')!.getAttribute('role')).toBe('grid');
        expect(document.querySelector('[rdxAutocompleteRow]')!.getAttribute('role')).toBe('row');
    });

    it('ArrowDown moves down a column (keeping the column index)', async () => {
        key('ArrowDown');
        await settle(); // opens + highlights first cell (Red)
        expect(highlighted()?.textContent?.trim()).toBe('Red');
        key('ArrowRight');
        await settle(); // Green
        expect(highlighted()?.textContent?.trim()).toBe('Green');
        key('ArrowDown');
        await settle(); // same column, next row → Magenta
        expect(highlighted()?.textContent?.trim()).toBe('Magenta');
    });

    it('ArrowUp moves up a column', async () => {
        key('ArrowDown');
        await settle();
        key('ArrowDown');
        await settle(); // Red → Cyan (row 2, col 0)
        expect(highlighted()?.textContent?.trim()).toBe('Cyan');
        key('ArrowUp');
        await settle(); // back to Red
        expect(highlighted()?.textContent?.trim()).toBe('Red');
    });

    it('selects a grid cell on Enter', async () => {
        key('ArrowDown');
        await settle();
        key('ArrowRight');
        await settle(); // Green
        key('Enter');
        await settle();
        expect(host.value()).toBe('Green');
    });
});
