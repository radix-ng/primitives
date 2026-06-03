import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div multiple rdxComboboxRoot [dir]="dir()" [(value)]="value" [(open)]="open">
            <div rdxComboboxAnchor>
                <div rdxComboboxChips>
                    @for (v of value(); track v) {
                        <span rdxComboboxChip [value]="v">
                            {{ v }}
                            <button rdxComboboxChipRemove aria-label="Remove">×</button>
                        </span>
                    }
                </div>
                <input rdxComboboxInput aria-label="Fruits" />
            </div>

            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (f of fruits; track f) {
                            <div rdxComboboxItem [value]="f">{{ f }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class ChipsHost {
    readonly value = signal<string[]>(['apple', 'banana', 'grape']);
    readonly open = signal(false);
    readonly dir = signal<'ltr' | 'rtl'>('ltr');
    readonly fruits = ['apple', 'banana', 'grape', 'orange'];
}

describe('Combobox chips navigation', () => {
    let fixture: ComponentFixture<ChipsHost>;
    let host: ChipsHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function chips(): HTMLElement[] {
        return Array.from(fixture.nativeElement.querySelectorAll('[rdxComboboxChip]'));
    }
    function keyOn(el: HTMLElement, key: string): void {
        el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [ChipsHost] });
        fixture = TestBed.createComponent(ChipsHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('ArrowLeft from the start of the input focuses the last chip', () => {
        inputEl().focus();
        inputEl().setSelectionRange(0, 0);
        keyOn(inputEl(), 'ArrowLeft');
        expect(document.activeElement).toBe(chips()[2]);
    });

    it('ArrowLeft / ArrowRight move focus between chips', () => {
        chips()[2].focus();
        keyOn(chips()[2], 'ArrowLeft');
        expect(document.activeElement).toBe(chips()[1]);
        keyOn(chips()[1], 'ArrowRight');
        expect(document.activeElement).toBe(chips()[2]);
    });

    it('uses role="toolbar" on the chips container (NVDA focus mode)', () => {
        expect(fixture.nativeElement.querySelector('[rdxComboboxChips]').getAttribute('role')).toBe('toolbar');
        // The chips themselves carry no role (focusable toolbar children).
        expect(chips()[0].hasAttribute('role')).toBe(false);
    });

    it('flips chip arrow navigation in RTL', async () => {
        host.dir.set('rtl');
        await settle();
        chips()[1].focus();
        // RTL: ArrowRight moves toward the first chip (previous), ArrowLeft toward the input (next).
        keyOn(chips()[1], 'ArrowRight');
        expect(document.activeElement).toBe(chips()[0]);
        keyOn(chips()[0], 'ArrowLeft');
        expect(document.activeElement).toBe(chips()[1]);
        // ArrowLeft from the last chip returns to the input.
        chips()[2].focus();
        keyOn(chips()[2], 'ArrowLeft');
        expect(document.activeElement).toBe(inputEl());
    });

    it('steps into the chips with ArrowRight in RTL (from the input start)', async () => {
        host.dir.set('rtl');
        await settle();
        inputEl().focus();
        inputEl().setSelectionRange(0, 0);
        keyOn(inputEl(), 'ArrowRight');
        expect(document.activeElement).toBe(chips()[2]);
    });

    it('ArrowRight from the last chip returns focus to the input', () => {
        chips()[2].focus();
        keyOn(chips()[2], 'ArrowRight');
        expect(document.activeElement).toBe(inputEl());
    });

    it('Backspace on a focused chip removes it and focuses the previous chip', async () => {
        chips()[2].focus();
        keyOn(chips()[2], 'Backspace');
        await settle();
        expect(host.value()).toEqual(['apple', 'banana']);
        expect(document.activeElement).toBe(chips()[1]);
    });

    it('Delete on the first chip removes it and focuses the next chip', async () => {
        chips()[0].focus();
        keyOn(chips()[0], 'Delete');
        await settle();
        expect(host.value()).toEqual(['banana', 'grape']);
        // focus moved to what is now the first chip (formerly "banana")
        expect(document.activeElement).toBe(chips()[0]);
    });

    it('the chip remove button deselects its value', async () => {
        const removeBtn = chips()[1].querySelector('button')!;
        removeBtn.click();
        await settle();
        expect(host.value()).toEqual(['apple', 'grape']);
    });
});
