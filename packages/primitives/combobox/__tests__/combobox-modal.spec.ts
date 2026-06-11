import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

@Component({
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" [modal]="modal()" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div data-testid="backdrop" rdxComboboxBackdrop></div>
                    <div rdxComboboxPositioner>
                        <div rdxComboboxPopup>
                            <div rdxComboboxList aria-label="Fruits">
                                @for (fruit of fruits; track fruit) {
                                    <div [value]="fruit" rdxComboboxItem>{{ fruit }}</div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
class ModalHost {
    readonly open = signal(false);
    readonly modal = signal(true);
    readonly fruits = ['Apple', 'Banana'];
}

describe('Combobox modal', () => {
    let fixture: ComponentFixture<ModalHost>;
    let host: ModalHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [ModalHost] });
        fixture = TestBed.createComponent(ModalHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('locks body scroll while a modal popup is open and restores it on close', async () => {
        expect(document.body.style.overflow).not.toBe('hidden');
        host.open.set(true);
        await settle();
        expect(document.body.style.overflow).toBe('hidden');
        host.open.set(false);
        await settle();
        expect(document.body.style.overflow).not.toBe('hidden');
    });

    it('does not lock scroll when not modal', async () => {
        host.modal.set(false);
        await settle();
        host.open.set(true);
        await settle();
        expect(document.body.style.overflow).not.toBe('hidden');
    });

    it('renders a backdrop with data-open while open', async () => {
        host.open.set(true);
        await settle();
        const backdrop = document.querySelector('[data-testid="backdrop"]') as HTMLElement;
        expect(backdrop).toBeTruthy();
        expect(backdrop.hasAttribute('data-open')).toBe(true);
    });

    it('keeps the popup itself interactive (pointer-events auto) while outside is inert', async () => {
        host.open.set(true);
        await settle();
        const popup = document.querySelector('[rdxComboboxPopup]') as HTMLElement;
        expect(popup.style.pointerEvents).toBe('auto');
    });
});
