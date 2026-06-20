import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

    // Characterization (ADR 0014, Phase 0): grid moves into the shared engine in P2 — pin its edges.
    it('wraps from the last row back to the first on ArrowDown (loop)', async () => {
        key('ArrowDown');
        await settle(); // Red (row 0, col 0)
        key('ArrowDown');
        await settle(); // Cyan (row 1)
        key('ArrowDown');
        await settle(); // Black (row 2, last)
        expect(highlighted()?.textContent?.trim()).toBe('Black');
        key('ArrowDown');
        await settle(); // wraps to Red (row 0)
        expect(highlighted()?.textContent?.trim()).toBe('Red');
    });

    it('wraps from the first row to the last on ArrowUp (loop)', async () => {
        key('ArrowDown');
        await settle(); // Red (row 0)
        key('ArrowUp');
        await settle(); // wraps to Black (row 2)
        expect(highlighted()?.textContent?.trim()).toBe('Black');
    });

    it('clamps the column to a shorter target row', async () => {
        host.rows.set([['A', 'B', 'C'], ['D']]);
        await settle();
        key('ArrowDown');
        await settle(); // A (row 0, col 0)
        key('ArrowRight');
        await settle(); // B
        key('ArrowRight');
        await settle(); // C (col 2)
        expect(highlighted()?.textContent?.trim()).toBe('C');
        key('ArrowDown');
        await settle(); // row 1 has only 'D' → column clamps to it
        expect(highlighted()?.textContent?.trim()).toBe('D');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete],
    template: `
        <div [(open)]="open" grid rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="X" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="X">
                        <div rdxAutocompleteRow>
                            <div rdxAutocompleteItem>A</div>
                        </div>
                        <div rdxAutocompleteItem>Loose</div>
                    </div>
                </div>
            </div>
        </div>
    `
})
class MixedHost {
    readonly open = signal(true);
}

describe('Autocomplete grid role resolution', () => {
    it('gives gridcell only to items inside a row, not to a stray item under a grid list', async () => {
        TestBed.configureTestingModule({ imports: [MixedHost] });
        const fixture = TestBed.createComponent(MixedHost);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        const items = Array.from(document.querySelectorAll('[rdxAutocompleteItem]'));
        const inRow = items.find((el) => el.textContent?.trim() === 'A')!;
        const loose = items.find((el) => el.textContent?.trim() === 'Loose')!;
        expect(inRow.getAttribute('role')).toBe('gridcell');
        expect(loose.getAttribute('role')).toBe('option');
    });
});
