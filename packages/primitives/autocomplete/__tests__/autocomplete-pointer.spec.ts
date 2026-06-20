import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';

/**
 * Autocomplete pointer/click selection (ADR 0014, Finding 6 — Base UI parity) — mirrors the combobox
 * suite. Selection is click-driven (works for programmatic clicks); a right-click or a bare mouseup
 * without a primary pointerdown does not select; a drag-end mouseup over the highlighted item does.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" [(open)]="open" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Fruit" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div rdxAutocompleteItem>{{ fruit }}</div>
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
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}

describe('Autocomplete pointer selection lifecycle', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll<HTMLElement>('[rdxAutocompleteItem]'));
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
        host.open.set(true);
        await settle();
    });

    it('selects on click (also covers programmatic click)', async () => {
        items()[1].click();
        await settle();
        expect(host.value()).toBe('Banana');
    });

    it('does not select on right-click or a mouseup over a non-highlighted item', async () => {
        items()[1].dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 2 }));
        items()[1].dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 2 }));
        await settle();
        expect(host.value()).toBe('');

        // Nothing highlighted → a primary mouseup must not select.
        items()[2].dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
        await settle();
        expect(host.value()).toBe('');
    });

    it('selects on a drag-end mouseup over the highlighted item (press began elsewhere)', async () => {
        key('ArrowDown'); // highlight Apple (items()[0])
        await settle();
        items()[1].dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }));
        items()[0].dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
        await settle();
        expect(host.value()).toBe('Apple');
    });
});
