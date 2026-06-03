import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * Regression (ADR 0014, Finding 1): a read-only / disabled combobox must not be user-mutable — Clear,
 * chip removal, and Backspace/Delete all route through the single guarded `commit`, so none of them
 * change the value. Base UI blocks these the same way.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div multiple rdxComboboxRoot [readOnly]="readOnly()" [disabled]="disabled()" [(value)]="value">
            <div rdxComboboxAnchor>
                <div rdxComboboxChips>
                    @for (fruit of value(); track fruit) {
                        <span rdxComboboxChip [value]="fruit">
                            {{ fruit }}
                            <button rdxComboboxChipRemove aria-label="Remove">×</button>
                        </span>
                    }
                </div>
                <input rdxComboboxInput aria-label="Fruits" />
            </div>
            <button rdxComboboxClear>clear</button>

            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div rdxComboboxItem [value]="fruit">{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal<string[]>(['Apple', 'Banana']);
    readonly readOnly = signal(true);
    readonly disabled = signal(false);
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}

describe('Combobox read-only value guard', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
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

    it('does not clear the selection via the Clear button when read-only', async () => {
        fixture.nativeElement.querySelector('[rdxComboboxClear]').click();
        await settle();
        expect(host.value()).toEqual(['Apple', 'Banana']);
    });

    it('does not remove a chip via the remove button when read-only', async () => {
        fixture.nativeElement.querySelector('[rdxComboboxChipRemove]').click();
        await settle();
        expect(host.value()).toEqual(['Apple', 'Banana']);
    });

    it('does not remove the last value on Backspace when read-only', async () => {
        inputEl().value = '';
        key('Backspace');
        await settle();
        expect(host.value()).toEqual(['Apple', 'Banana']);
    });

    it('also blocks mutation when disabled', async () => {
        host.readOnly.set(false);
        host.disabled.set(true);
        await settle();
        fixture.nativeElement.querySelector('[rdxComboboxClear]').click();
        fixture.nativeElement.querySelector('[rdxComboboxChipRemove]').click();
        await settle();
        expect(host.value()).toEqual(['Apple', 'Banana']);
    });
});
