import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" [modal]="modal()" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <ng-template rdxComboboxPortal>
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
        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);
        host.open.set(true);
        await settle();
        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(true);
        host.open.set(false);
        await settle();
        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);
    });

    it('does not lock scroll when not modal', async () => {
        host.modal.set(false);
        await settle();
        host.open.set(true);
        await settle();
        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);
    });

    it('renders a backdrop with data-open while open', async () => {
        host.open.set(true);
        await settle();
        const backdrop = document.querySelector('[data-testid="backdrop"]') as HTMLElement;
        expect(backdrop).toBeTruthy();
        expect(backdrop.hasAttribute('data-open')).toBe(true);
    });

    it('renders an internal backdrop for a modal popup (Base UI; replaces the global body pointer-lock)', async () => {
        host.open.set(true);
        await settle();

        // A modal combobox isolates the background with a full-viewport internal backdrop (the
        // outside-press target) instead of a global `body { pointer-events: none }` lock.
        expect(document.querySelector('[data-rdx-internal-backdrop]')).toBeTruthy();

        // With no body lock, the popup needs no `pointer-events: auto` opt-back-in.
        const popup = document.querySelector('[rdxComboboxPopup]') as HTMLElement;
        expect(popup.style.pointerEvents).toBe('');
    });
});
