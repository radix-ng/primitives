import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

/**
 * P2 (ADR 0014): grid navigation is a Combobox engine feature. ArrowUp/Down move between rows keeping
 * the column; ArrowLeft/Right move within a row; the list is `role="grid"`, rows are `role="row"`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div [(value)]="value" [(open)]="open" grid rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Color" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Colors">
                        @for (row of rows(); track $index) {
                            <div rdxComboboxRow>
                                @for (cell of row; track cell) {
                                    <div [value]="cell" rdxComboboxItem>{{ cell }}</div>
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
    readonly value = signal<string | null>(null);
    readonly open = signal(false);
    readonly rows = signal([
        ['Red', 'Green', 'Blue'],
        ['Cyan', 'Magenta', 'Yellow'],
        ['Black', 'White', 'Gray']
    ]);
}

describe('Combobox grid', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxComboboxItem]'));
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

    it('sets grid/row/gridcell roles and aria-haspopup=grid on the input', async () => {
        host.open.set(true);
        await settle();
        expect(document.querySelector('[rdxComboboxList]')!.getAttribute('role')).toBe('grid');
        expect(document.querySelector('[rdxComboboxRow]')!.getAttribute('role')).toBe('row');
        // Items inside a grid become gridcell (Base UI), and the input advertises the grid popup.
        expect(items()[0].getAttribute('role')).toBe('gridcell');
        expect(inputEl().getAttribute('aria-haspopup')).toBe('grid');
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

    it('ArrowLeft / ArrowRight move within a row', async () => {
        key('ArrowDown');
        await settle(); // Red
        key('ArrowRight');
        await settle(); // Green
        expect(highlighted()?.textContent?.trim()).toBe('Green');
        key('ArrowLeft');
        await settle(); // back to Red
        expect(highlighted()?.textContent?.trim()).toBe('Red');
    });

    it('wraps from the last row to the first on ArrowDown (loop)', async () => {
        key('ArrowDown');
        await settle(); // Red (row 0)
        key('ArrowDown');
        await settle(); // Cyan (row 1)
        key('ArrowDown');
        await settle(); // Black (row 2, last)
        expect(highlighted()?.textContent?.trim()).toBe('Black');
        key('ArrowDown');
        await settle(); // wraps to Red
        expect(highlighted()?.textContent?.trim()).toBe('Red');
    });

    it('clamps the column to a shorter target row', async () => {
        host.rows.set([['A', 'B', 'C'], ['D']]);
        await settle();
        key('ArrowDown');
        await settle(); // A
        key('ArrowRight');
        await settle(); // B
        key('ArrowRight');
        await settle(); // C (col 2)
        expect(highlighted()?.textContent?.trim()).toBe('C');
        key('ArrowDown');
        await settle(); // row 1 has only 'D' → column clamps
        expect(highlighted()?.textContent?.trim()).toBe('D');
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

    it('Home jumps to the first cell and End to the last (grid is a filtered list)', async () => {
        host.open.set(true);
        await settle();
        key('ArrowDown'); // some highlight first
        await settle();
        key('End');
        await settle();
        expect(highlighted()?.textContent?.trim()).toBe('Gray'); // last item
        key('Home');
        await settle();
        expect(highlighted()?.textContent?.trim()).toBe('Red'); // first item
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" grid rdxComboboxRoot>
            <input rdxComboboxInput aria-label="X" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="X">
                        <div rdxComboboxRow>
                            <div value="a" rdxComboboxItem>A</div>
                        </div>
                        <div value="loose" rdxComboboxItem>Loose</div>
                    </div>
                </div>
            </div>
        </div>
    `
})
class MixedHost {
    readonly open = signal(true);
}

describe('Combobox grid role resolution', () => {
    it('gives gridcell only to items inside a row, not to a stray item under a grid list', async () => {
        TestBed.configureTestingModule({ imports: [MixedHost] });
        const fixture = TestBed.createComponent(MixedHost);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        const items = Array.from(document.querySelectorAll('[rdxComboboxItem]'));
        const inRow = items.find((el) => el.textContent?.trim() === 'A')!;
        const loose = items.find((el) => el.textContent?.trim() === 'Loose')!;
        expect(inRow.getAttribute('role')).toBe('gridcell');
        expect(loose.getAttribute('role')).toBe('option');
    });
});
