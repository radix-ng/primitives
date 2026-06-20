import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div [(value)]="value" [(open)]="open" [disabled]="disabled()" rdxComboboxRoot>
            <div rdxComboboxInputGroup>
                <input rdxComboboxInput aria-label="Fruit" />
                <button [disabled]="clearDisabled()" rdxComboboxClear>clear</button>
            </div>
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        <div [value]="'apple'" rdxComboboxItem>Apple</div>
                        <div rdxComboboxSeparator></div>
                        <div [value]="'banana'" rdxComboboxItem>Banana</div>
                    </div>
                    <div rdxComboboxEmpty>No results</div>
                    <div rdxComboboxStatus>1 result</div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal<string | null>(null);
    readonly open = signal(false);
    readonly disabled = signal(false);
    readonly clearDisabled = signal(false);
}

describe('Combobox parts (P5 parity)', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function el(sel: string): HTMLElement {
        return fixture.nativeElement.querySelector(sel) ?? document.querySelector(sel)!;
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        host.open.set(true); // mount the portal so the popup parts render
        await settle();
    });

    it('separator carries role=separator with a horizontal orientation', () => {
        const sep = el('[rdxComboboxSeparator]');
        expect(sep.getAttribute('role')).toBe('separator');
        expect(sep.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('Status and Empty are atomic live regions', () => {
        const status = el('[rdxComboboxStatus]');
        expect(status.getAttribute('role')).toBe('status');
        expect(status.getAttribute('aria-atomic')).toBe('true');
        const empty = el('[rdxComboboxEmpty]');
        expect(empty.getAttribute('role')).toBe('status');
        expect(empty.getAttribute('aria-live')).toBe('polite');
        expect(empty.getAttribute('aria-atomic')).toBe('true');
    });

    it('InputGroup mirrors state via data-* attributes', async () => {
        const group = el('[rdxComboboxInputGroup]');
        expect(group.hasAttribute('data-filled')).toBe(false);
        expect(group.hasAttribute('data-disabled')).toBe(false);

        host.value.set('apple');
        host.disabled.set(true);
        await settle();
        expect(group.hasAttribute('data-filled')).toBe(true);
        expect(group.hasAttribute('data-disabled')).toBe(true);
    });

    it('Clear.disabled disables just the clear button', async () => {
        host.value.set('apple');
        await settle();
        const clear = el('[rdxComboboxClear]');
        expect(clear.hasAttribute('disabled')).toBe(false);
        host.clearDisabled.set(true);
        await settle();
        expect(clear.hasAttribute('disabled')).toBe(true);
    });
});
